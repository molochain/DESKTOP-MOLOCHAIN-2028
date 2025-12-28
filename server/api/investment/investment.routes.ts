import { Express, Request, Response } from 'express';
import Stripe from 'stripe';
import { db } from '../../db';
import { 
  investmentRounds, 
  investors, 
  investments, 
  investmentTransactions,
  userWallets 
} from '@db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { logger } from '../../utils/logger';
import { requireAuth } from '../../middleware/auth';

// Initialize Stripe only if API key is provided
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-08-27.basil'
  });
  logger.info('Stripe initialized successfully');
} else {
  logger.warn('Stripe not initialized - no API key provided. Credit card payments will be unavailable.');
}

export function setupInvestmentRoutes(app: Express) {
  // Get active investment rounds
  app.get('/api/investment/rounds', requireAuth, async (_req: Request, res: Response) => {
    try {
      const rounds = await db
        .select()
        .from(investmentRounds)
        .where(eq(investmentRounds.status, 'active'))
        .orderBy(investmentRounds.createdAt);
      
      res.json(rounds);
    } catch (error) {
      logger.error('Error fetching investment rounds:', error);
      res.status(500).json({ message: 'Failed to fetch investment rounds' });
    }
  });

  // Get specific investment round
  app.get('/api/investment/rounds/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const [round] = await db
        .select()
        .from(investmentRounds)
        .where(eq(investmentRounds.id, id))
        .limit(1);
      
      if (!round) {
        return res.status(404).json({ message: 'Investment round not found' });
      }
      
      res.json(round);
    } catch (error) {
      logger.error('Error fetching investment round:', error);
      res.status(500).json({ message: 'Failed to fetch investment round' });
    }
  });

  // Get or create investor profile
  app.get('/api/investment/investor', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      let [investor] = await db
        .select()
        .from(investors)
        .where(eq(investors.userId, userId))
        .limit(1);
      
      // Create investor profile if doesn't exist
      if (!investor) {
        [investor] = await db
          .insert(investors)
          .values({
            userId,
            kycStatus: 'pending',
            totalInvested: '0',
            accreditedStatus: false,
            investorType: 'individual'
          })
          .returning();
      }
      
      res.json(investor);
    } catch (error) {
      logger.error('Error fetching investor profile:', error);
      res.status(500).json({ message: 'Failed to fetch investor profile' });
    }
  });

  // Update KYC status
  app.post('/api/investment/kyc', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { kycData, accreditedStatus } = req.body;
      
      const [investor] = await db
        .update(investors)
        .set({
          kycStatus: 'submitted',
          kycSubmittedAt: new Date(),
          accreditedStatus,
          accreditationDocuments: kycData.documents,
          updatedAt: new Date()
        })
        .where(eq(investors.userId, userId))
        .returning();
      
      res.json(investor);
    } catch (error) {
      logger.error('Error updating KYC:', error);
      res.status(500).json({ message: 'Failed to update KYC' });
    }
  });

  // Create Stripe payment intent for credit card investment
  app.post('/api/investment/stripe/create-intent', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { amount, roundId } = req.body;
      
      // Validate investment round
      const [round] = await db
        .select()
        .from(investmentRounds)
        .where(eq(investmentRounds.id, roundId))
        .limit(1);
      
      if (!round || round.status !== 'active') {
        return res.status(400).json({ message: 'Invalid investment round' });
      }
      
      // Check investment limits
      if (parseFloat(amount) < parseFloat(round.minimumInvestment || '0')) {
        return res.status(400).json({ 
          message: `Minimum investment is $${round.minimumInvestment}` 
        });
      }
      
      if (round.maximumInvestment && parseFloat(amount) > parseFloat(round.maximumInvestment)) {
        return res.status(400).json({ 
          message: `Maximum investment is $${round.maximumInvestment}` 
        });
      }

      // Get investor profile
      const [investor] = await db
        .select()
        .from(investors)
        .where(eq(investors.userId, userId))
        .limit(1);
      
      if (!investor || investor.kycStatus !== 'verified') {
        return res.status(400).json({ 
          message: 'Please complete KYC verification before investing' 
        });
      }

      // Check if Stripe is configured
      if (!stripe) {
        return res.status(503).json({ 
          message: 'Credit card payments are not available. Please use crypto payment instead.' 
        });
      }

      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(parseFloat(amount) * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          investor_id: investor.id,
          round_id: roundId,
          user_id: userId.toString()
        }
      });

      // Create pending investment record
      const [investment] = await db
        .insert(investments)
        .values({
          investorId: investor.id,
          roundId,
          amount: amount.toString(),
          currency: 'USD',
          paymentMethod: 'stripe',
          paymentId: paymentIntent.id,
          status: 'pending'
        })
        .returning();

      res.json({
        clientSecret: paymentIntent.client_secret,
        investmentId: investment.id
      });
    } catch (error) {
      logger.error('Error creating payment intent:', error);
      res.status(500).json({ message: 'Failed to create payment intent' });
    }
  });

  // Confirm Stripe payment
  app.post('/api/investment/stripe/confirm', requireAuth, async (req: Request, res: Response) => {
    try {
      const { paymentIntentId, investmentId } = req.body;
      
      // Check if Stripe is configured
      if (!stripe) {
        return res.status(503).json({ 
          message: 'Credit card payments are not available. Please use crypto payment instead.' 
        });
      }
      
      // Verify payment with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ message: 'Payment not successful' });
      }

      // Calculate tokens allocated
      const [investment] = await db
        .select()
        .from(investments)
        .where(eq(investments.id, investmentId))
        .limit(1);
      
      const [round] = await db
        .select()
        .from(investmentRounds)
        .where(eq(investmentRounds.id, investment.roundId))
        .limit(1);
      
      const tokensAllocated = round.tokenPrice 
        ? (parseFloat(investment.amount) / parseFloat(round.tokenPrice)).toFixed(6)
        : '0';

      // Update investment status
      const [updatedInvestment] = await db
        .update(investments)
        .set({
          status: 'confirmed',
          confirmedAt: new Date(),
          tokensAllocated,
          updatedAt: new Date()
        })
        .where(eq(investments.id, investmentId))
        .returning();

      // Create transaction record
      await db.insert(investmentTransactions).values({
        investmentId,
        transactionType: 'payment',
        amount: investment.amount,
        currency: 'USD',
        processorReference: paymentIntentId,
        processorResponse: paymentIntent as any,
        status: 'completed',
        fee: (parseFloat(investment.amount) * 0.029 + 0.30).toFixed(2), // Stripe fee
        netAmount: (parseFloat(investment.amount) - (parseFloat(investment.amount) * 0.029 + 0.30)).toFixed(2),
        processedAt: new Date()
      });

      // Update investor's total invested
      await db
        .update(investors)
        .set({
          totalInvested: sql`${investors.totalInvested} + ${investment.amount}`,
          updatedAt: new Date()
        })
        .where(eq(investors.id, investment.investorId));

      // Update round's current amount
      await db
        .update(investmentRounds)
        .set({
          currentAmount: sql`${investmentRounds.currentAmount} + ${investment.amount}`,
          updatedAt: new Date()
        })
        .where(eq(investmentRounds.id, investment.roundId));

      res.json({ 
        success: true, 
        investment: updatedInvestment,
        tokensAllocated 
      });
    } catch (error) {
      logger.error('Error confirming payment:', error);
      res.status(500).json({ message: 'Failed to confirm payment' });
    }
  });

  // Connect wallet for crypto payments
  app.post('/api/investment/wallet/connect', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { address, chainId, chainName, walletType, signature } = req.body;
      
      // Check if wallet already exists
      const existingWallet = await db
        .select()
        .from(userWallets)
        .where(and(
          eq(userWallets.userId, userId),
          eq(userWallets.address, address)
        ))
        .limit(1);
      
      if (existingWallet.length > 0) {
        // Update last active
        await db
          .update(userWallets)
          .set({ lastActive: new Date() })
          .where(eq(userWallets.id, existingWallet[0].id));
        
        return res.json(existingWallet[0]);
      }
      
      // Create new wallet entry
      const [wallet] = await db
        .insert(userWallets)
        .values({
          userId,
          address,
          chainId,
          chainName,
          walletType,
          verificationSignature: signature,
          isPrimary: true,
          lastActive: new Date()
        })
        .returning();
      
      res.json(wallet);
    } catch (error) {
      logger.error('Error connecting wallet:', error);
      res.status(500).json({ message: 'Failed to connect wallet' });
    }
  });

  // Create crypto investment
  app.post('/api/investment/crypto/create', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { amount, currency, roundId, walletAddress } = req.body;
      
      // Get investor profile
      const [investor] = await db
        .select()
        .from(investors)
        .where(eq(investors.userId, userId))
        .limit(1);
      
      if (!investor || investor.kycStatus !== 'verified') {
        return res.status(400).json({ 
          message: 'Please complete KYC verification before investing' 
        });
      }

      // Create investment record
      const [investment] = await db
        .insert(investments)
        .values({
          investorId: investor.id,
          roundId,
          amount: amount.toString(),
          currency,
          paymentMethod: 'crypto',
          status: 'pending'
        })
        .returning();

      // Generate payment address (in production, this would be from your crypto payment processor)
      const paymentAddress = process.env.CRYPTO_PAYMENT_ADDRESS || '0x1234567890abcdef';
      
      res.json({
        investmentId: investment.id,
        paymentAddress,
        amount,
        currency,
        memo: `INV-${investment.id}` // Payment identifier
      });
    } catch (error) {
      logger.error('Error creating crypto investment:', error);
      res.status(500).json({ message: 'Failed to create crypto investment' });
    }
  });

  // Get user's investments
  app.get('/api/investment/my-investments', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      
      // Get investor profile
      const [investor] = await db
        .select()
        .from(investors)
        .where(eq(investors.userId, userId))
        .limit(1);
      
      if (!investor) {
        return res.json([]);
      }

      // Get all investments with round details
      const userInvestments = await db
        .select({
          investment: investments,
          round: investmentRounds
        })
        .from(investments)
        .leftJoin(investmentRounds, eq(investments.roundId, investmentRounds.id))
        .where(eq(investments.investorId, investor.id))
        .orderBy(investments.createdAt);
      
      res.json(userInvestments);
    } catch (error) {
      logger.error('Error fetching user investments:', error);
      res.status(500).json({ message: 'Failed to fetch investments' });
    }
  });

  logger.info('Investment routes initialized');
}