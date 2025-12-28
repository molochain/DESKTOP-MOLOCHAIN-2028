/**
 * Mololink API Routes - Professional Network & Marketplace Backend
 * 
 * @description Backend API endpoints for the Mololink module
 * @prefix /api/mololink (registered in ecosystem.registrar.ts)
 * @frontend client/src/routes/mololink.routes.ts
 * 
 * Verified Endpoints (December 24, 2025):
 * 
 * PUBLIC (no auth):
 * - GET /companies - List companies with pagination and search
 * - GET /companies/:id - Get company details by ID
 * - GET /marketplace/listings - List marketplace listings
 * - GET /marketplace/auctions - List active auctions
 * - GET /profile/:userId - Get public profile by user ID
 * - GET /posts - List network posts
 * - GET /search - Search across companies, profiles, posts
 * 
 * AUTHENTICATED:
 * - GET /profile - Get current user's profile
 * - PUT /profile - Update current user's profile
 * - POST /posts - Create new post
 * - POST /companies - Create new company
 * - POST /marketplace/listings - Create new listing
 * - POST /marketplace/auctions - Create new auction
 * - POST /marketplace/auctions/:id/bids - Place bid on auction
 * - GET /connections - Get user's connections
 * - POST /connections - Create connection request
 * - PUT /connections/:id - Update connection status
 * 
 * Database Tables: mololink_profiles, mololink_companies, mololink_posts,
 * mololink_connections, marketplace_listings, marketplace_auctions, marketplace_bids
 */
import { Router } from 'express';
import { z } from 'zod';
import { eq, desc, like, and, or, count } from 'drizzle-orm';
import { db } from '../db';
import { 
  mololinkProfiles,
  mololinkCompanies,
  mololinkCompanyEmployees,
  mololinkPosts,
  mololinkCompanyPosts,
  mololinkComments,
  mololinkConnections,
  mololinkSkills,
  marketplaceListings,
  marketplaceAuctions,
  marketplaceBids,
  marketplaceServicePosts,
  users,
  insertMololinkProfileSchema,
  insertMololinkCompanySchema,
  insertMololinkPostSchema,
  insertMololinkConnectionSchema,
  insertMololinkSkillSchema,
  insertMarketplaceListingSchema,
  insertMarketplaceAuctionSchema,
  insertMarketplaceBidSchema,
  insertMarketplaceServicePostSchema,
} from '@db/schema';
import { isAuthenticated } from '../core/auth/auth.service';
import { logger } from '../utils/logger';
import { validateRequest } from '../middleware/validate';

const router = Router();

// ===========================================
// PUBLIC ROUTES (no authentication required)
// ===========================================

// Get companies list (PUBLIC)
router.get('/companies', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = (page - 1) * limit;
    const search = req.query.search as string;

    let whereCondition;
    if (search) {
      whereCondition = or(
        like(mololinkCompanies.name, `%${search}%`),
        like(mololinkCompanies.industry, `%${search}%`)
      );
    }

    const companies = await db.select()
      .from(mololinkCompanies)
      .where(whereCondition)
      .orderBy(desc(mololinkCompanies.createdAt))
      .limit(limit)
      .offset(offset);

    res.json(companies);
  } catch (error) {
    logger.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

// Get company by ID (PUBLIC)
router.get('/companies/:id', async (req, res) => {
  try {
    const companyId = parseInt(req.params.id);
    
    const companies = await db.select()
      .from(mololinkCompanies)
      .where(eq(mololinkCompanies.id, companyId))
      .limit(1);

    if (companies.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json(companies[0]);
  } catch (error) {
    logger.error('Error fetching company:', error);
    res.status(500).json({ error: 'Failed to fetch company' });
  }
});

// Get marketplace listings (PUBLIC)
router.get('/marketplace/listings', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limitNum = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = (page - 1) * limitNum;
    const category = req.query.category as string;
    const search = req.query.search as string;

    let whereCondition = eq(marketplaceListings.status, 'active');
    
    if (category) {
      whereCondition = and(whereCondition, eq(marketplaceListings.category, category));
    }
    
    if (search) {
      whereCondition = and(
        whereCondition,
        or(
          like(marketplaceListings.title, `%${search}%`),
          like(marketplaceListings.description, `%${search}%`)
        )
      );
    }

    // Use simple select without relations (seller relation not defined in schema)
    const listings = await db
      .select()
      .from(marketplaceListings)
      .where(whereCondition)
      .orderBy(desc(marketplaceListings.createdAt))
      .limit(limitNum)
      .offset(offset);

    res.json(listings);
  } catch (error) {
    logger.error('Error fetching marketplace listings:', error);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

// Get marketplace auctions (PUBLIC)
router.get('/marketplace/auctions', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limitNum = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = (page - 1) * limitNum;
    const category = req.query.category as string;

    let whereCondition = eq(marketplaceAuctions.status, 'active');
    
    if (category) {
      whereCondition = and(whereCondition, eq(marketplaceAuctions.category, category));
    }

    // Use simple select without relations (seller/bids relations not defined in schema)
    const auctions = await db
      .select()
      .from(marketplaceAuctions)
      .where(whereCondition)
      .orderBy(desc(marketplaceAuctions.endTime))
      .limit(limitNum)
      .offset(offset);

    res.json(auctions);
  } catch (error) {
    logger.error('Error fetching marketplace auctions:', error);
    res.status(500).json({ error: 'Failed to fetch auctions' });
  }
});

// Get profile by user ID (PUBLIC)
router.get('/profile/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    const profiles = await db.select()
      .from(mololinkProfiles)
      .where(eq(mololinkProfiles.userId, userId))
      .limit(1);

    if (profiles.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profiles[0]);
  } catch (error) {
    logger.error('Error fetching MOLOLINK profile by user ID:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Get public posts feed (PUBLIC)
router.get('/posts', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limitNum = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = (page - 1) * limitNum;

    const posts = await db.select()
      .from(mololinkPosts)
      .orderBy(desc(mololinkPosts.createdAt))
      .limit(limitNum)
      .offset(offset);

    res.json(posts);
  } catch (error) {
    logger.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Search across all entities (PUBLIC)
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q as string;
    const type = req.query.type as string || 'all';
    const page = parseInt(req.query.page as string) || 1;
    const limitNum = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = (page - 1) * limitNum;

    const results: any = {};

    if (type === 'all' || type === 'companies') {
      let companyWhere;
      if (query) {
        companyWhere = or(
          like(mololinkCompanies.name, `%${query}%`),
          like(mololinkCompanies.industry, `%${query}%`)
        );
      }
      results.companies = await db.select()
        .from(mololinkCompanies)
        .where(companyWhere)
        .limit(type === 'all' ? 5 : limitNum)
        .offset(type === 'companies' ? offset : 0);
    }

    if (type === 'all' || type === 'profiles') {
      let profileWhere;
      if (query) {
        profileWhere = or(
          like(mololinkProfiles.firstName, `%${query}%`),
          like(mololinkProfiles.lastName, `%${query}%`),
          like(mololinkProfiles.headline, `%${query}%`)
        );
      }
      results.profiles = await db.select()
        .from(mololinkProfiles)
        .where(profileWhere)
        .limit(type === 'all' ? 5 : limitNum)
        .offset(type === 'profiles' ? offset : 0);
    }

    if (type === 'all' || type === 'listings') {
      let listingWhere = eq(marketplaceListings.status, 'active');
      if (query) {
        listingWhere = and(
          listingWhere,
          or(
            like(marketplaceListings.title, `%${query}%`),
            like(marketplaceListings.description, `%${query}%`)
          )
        )!;
      }
      results.listings = await db.select()
        .from(marketplaceListings)
        .where(listingWhere)
        .limit(type === 'all' ? 5 : limitNum)
        .offset(type === 'listings' ? offset : 0);
    }

    res.json(results);
  } catch (error) {
    logger.error('Error searching:', error);
    res.status(500).json({ error: 'Failed to search' });
  }
});

// ===========================================
// PROTECTED ROUTES (authentication required)
// ===========================================

// Get current user's MOLOLINK profile
router.get('/profile', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    const profile = await db.query.mololinkProfiles.findFirst({
      where: eq(mololinkProfiles.userId, userId),
      with: {
        user: true,
        skills: true,
        employments: {
          with: {
            company: true,
          },
        },
      },
    });

    if (!profile) {
      // Create default profile if none exists
      const [newProfile] = await db.insert(mololinkProfiles).values({
        userId,
        firstName: req.user!.username,
        lastName: '',
      }).returning();
      
      return res.json({ ...newProfile, user: req.user, skills: [], employments: [] });
    }

    res.json(profile);
  } catch (error) {
    logger.error('Error fetching MOLOLINK profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update current user's profile (PROTECTED)
router.put('/profile', isAuthenticated, validateRequest({ body: insertMololinkProfileSchema.partial() }), async (req, res) => {
  try {
    const userId = req.user!.id;
    
    const [updatedProfile] = await db.update(mololinkProfiles)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(mololinkProfiles.userId, userId))
      .returning();

    if (!updatedProfile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(updatedProfile);
  } catch (error) {
    logger.error('Error updating MOLOLINK profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ===========================================
// POSTS ROUTES (PROTECTED)
// ===========================================

// Create new post (PROTECTED)
router.post('/posts', isAuthenticated, validateRequest({ body: insertMololinkPostSchema.omit({ userId: true, profileId: true }) }), async (req, res) => {
  try {
    const userId = req.user!.id;
    
    // Get user's profile
    const profile = await db.query.mololinkProfiles.findFirst({
      where: eq(mololinkProfiles.userId, userId),
    });

    if (!profile) {
      return res.status(400).json({ error: 'MOLOLINK profile required to create posts' });
    }

    const [newPost] = await db.insert(mololinkPosts).values({
      ...req.body,
      userId,
      profileId: profile.id,
    }).returning();

    const postWithDetails = await db.query.mololinkPosts.findFirst({
      where: eq(mololinkPosts.id, newPost.id),
      with: {
        user: true,
        profile: true,
      },
    });

    res.status(201).json(postWithDetails);
  } catch (error) {
    logger.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// ===========================================
// COMPANIES ROUTES (PROTECTED)
// ===========================================

// Create new company (PROTECTED)
router.post('/companies', isAuthenticated, validateRequest({ body: insertMololinkCompanySchema }), async (req, res) => {
  try {
    const [newCompany] = await db.insert(mololinkCompanies)
      .values(req.body)
      .returning();

    res.status(201).json(newCompany);
  } catch (error) {
    logger.error('Error creating company:', error);
    res.status(500).json({ error: 'Failed to create company' });
  }
});

// ===========================================
// MARKETPLACE ROUTES (PROTECTED)
// ===========================================

// Create marketplace listing (PROTECTED)
router.post('/marketplace/listings', isAuthenticated, validateRequest({ body: insertMarketplaceListingSchema.omit({ sellerId: true }) }), async (req, res) => {
  try {
    const [newListing] = await db.insert(marketplaceListings)
      .values({
        ...req.body,
        sellerId: req.user!.id,
      })
      .returning();

    const listingWithSeller = await db.query.marketplaceListings.findFirst({
      where: eq(marketplaceListings.id, newListing.id),
      with: {
        seller: true,
      },
    });

    res.status(201).json(listingWithSeller);
  } catch (error) {
    logger.error('Error creating marketplace listing:', error);
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

// Create marketplace auction (PROTECTED)
router.post('/marketplace/auctions', isAuthenticated, validateRequest({ body: insertMarketplaceAuctionSchema.omit({ sellerId: true, currentPrice: true }) }), async (req, res) => {
  try {
    const [newAuction] = await db.insert(marketplaceAuctions)
      .values({
        ...req.body,
        sellerId: req.user!.id,
        currentPrice: req.body.startingPrice,
      })
      .returning();

    const auctionWithSeller = await db.query.marketplaceAuctions.findFirst({
      where: eq(marketplaceAuctions.id, newAuction.id),
      with: {
        seller: true,
        bids: true,
      },
    });

    res.status(201).json(auctionWithSeller);
  } catch (error) {
    logger.error('Error creating marketplace auction:', error);
    res.status(500).json({ error: 'Failed to create auction' });
  }
});

// Place bid on auction (PROTECTED)
router.post('/marketplace/auctions/:id/bids', isAuthenticated, validateRequest({ body: insertMarketplaceBidSchema.omit({ auctionId: true, bidderId: true }) }), async (req, res) => {
  try {
    const auctionId = parseInt(req.params.id);
    
    // Check if auction exists and is active
    const auction = await db.query.marketplaceAuctions.findFirst({
      where: eq(marketplaceAuctions.id, auctionId),
    });

    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }

    if (auction.status !== 'active') {
      return res.status(400).json({ error: 'Auction is not active' });
    }

    if (new Date() > auction.endTime) {
      return res.status(400).json({ error: 'Auction has ended' });
    }

    if (req.body.amount <= auction.currentPrice) {
      return res.status(400).json({ error: 'Bid must be higher than current price' });
    }

    // Update all previous bids to outbid
    await db.update(marketplaceBids)
      .set({ status: 'outbid' })
      .where(eq(marketplaceBids.auctionId, auctionId));

    // Create new bid
    const [newBid] = await db.insert(marketplaceBids)
      .values({
        ...req.body,
        auctionId,
        bidderId: req.user!.id,
        status: 'winning',
      })
      .returning();

    // Update auction current price and bid count
    await db.update(marketplaceAuctions)
      .set({
        currentPrice: req.body.amount,
        bidCount: auction.bidCount + 1,
      })
      .where(eq(marketplaceAuctions.id, auctionId));

    const bidWithBidder = await db.query.marketplaceBids.findFirst({
      where: eq(marketplaceBids.id, newBid.id),
      with: {
        bidder: true,
        auction: true,
      },
    });

    res.status(201).json(bidWithBidder);
  } catch (error) {
    logger.error('Error placing bid:', error);
    res.status(500).json({ error: 'Failed to place bid' });
  }
});

// ===========================================
// CONNECTIONS ROUTES (PROTECTED)
// ===========================================

// Get user's connections (PROTECTED)
router.get('/connections', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    const status = req.query.status as string || 'accepted';

    const connections = await db.query.mololinkConnections.findMany({
      where: and(
        or(
          eq(mololinkConnections.requesterId, userId),
          eq(mololinkConnections.receiverId, userId)
        ),
        eq(mololinkConnections.status, status)
      ),
      with: {
        requester: true,
        receiver: true,
      },
    });

    res.json(connections);
  } catch (error) {
    logger.error('Error fetching connections:', error);
    res.status(500).json({ error: 'Failed to fetch connections' });
  }
});

// Send connection request (PROTECTED)
router.post('/connections', isAuthenticated, validateRequest({ 
  body: z.object({ 
    receiverId: z.number().int().positive() 
  }) 
}), async (req, res) => {
  try {
    const requesterId = req.user!.id;
    const { receiverId } = req.body;

    if (requesterId === receiverId) {
      return res.status(400).json({ error: 'Cannot connect to yourself' });
    }

    // Check if connection already exists
    const existing = await db.query.mololinkConnections.findFirst({
      where: and(
        or(
          and(
            eq(mololinkConnections.requesterId, requesterId),
            eq(mololinkConnections.receiverId, receiverId)
          ),
          and(
            eq(mololinkConnections.requesterId, receiverId),
            eq(mololinkConnections.receiverId, requesterId)
          )
        )
      ),
    });

    if (existing) {
      return res.status(400).json({ error: 'Connection already exists' });
    }

    const [newConnection] = await db.insert(mololinkConnections)
      .values({
        requesterId,
        receiverId,
        status: 'pending',
      })
      .returning();

    const connectionWithUsers = await db.query.mololinkConnections.findFirst({
      where: eq(mololinkConnections.id, newConnection.id),
      with: {
        requester: true,
        receiver: true,
      },
    });

    res.status(201).json(connectionWithUsers);
  } catch (error) {
    logger.error('Error creating connection:', error);
    res.status(500).json({ error: 'Failed to create connection' });
  }
});

// Accept/reject connection request (PROTECTED)
router.put('/connections/:id', isAuthenticated, validateRequest({ 
  body: z.object({ 
    status: z.enum(['accepted', 'rejected']) 
  }) 
}), async (req, res) => {
  try {
    const connectionId = parseInt(req.params.id);
    const userId = req.user!.id;
    const { status } = req.body;

    // Verify user is the receiver of this connection request
    const connection = await db.query.mololinkConnections.findFirst({
      where: and(
        eq(mololinkConnections.id, connectionId),
        eq(mololinkConnections.receiverId, userId),
        eq(mololinkConnections.status, 'pending')
      ),
    });

    if (!connection) {
      return res.status(404).json({ error: 'Connection request not found' });
    }

    const [updatedConnection] = await db.update(mololinkConnections)
      .set({ status, updatedAt: new Date() })
      .where(eq(mololinkConnections.id, connectionId))
      .returning();

    const connectionWithUsers = await db.query.mololinkConnections.findFirst({
      where: eq(mololinkConnections.id, connectionId),
      with: {
        requester: true,
        receiver: true,
      },
    });

    res.json(connectionWithUsers);
  } catch (error) {
    logger.error('Error updating connection:', error);
    res.status(500).json({ error: 'Failed to update connection' });
  }
});

export default router;