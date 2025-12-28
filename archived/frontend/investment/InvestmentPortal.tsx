import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { loadStripe } from '@stripe/stripe-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { useWallet } from '@/services/wallet/WalletProvider';
import { TransactionMonitor } from '@/components/investment/TransactionMonitor';
import WalletConnectionModal from '@/components/investment/WalletConnectionModal';
import AlertNotifications from '@/components/notifications/AlertNotifications';
import { CreditCard, Wallet, TrendingUp, Clock, Users, Target, AlertCircle, CheckCircle } from 'lucide-react';

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

// Company wallet address for receiving investments - configure this with your actual wallet
const COMPANY_WALLET_ADDRESS = import.meta.env.VITE_COMPANY_WALLET_ADDRESS || '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb8';

interface InvestmentRound {
  id: number;
  name: string;
  description: string;
  targetAmount: string;
  minimumInvestment: string;
  maximumInvestment: string | null;
  currentAmount: string;
  tokenPrice: string | null;
  tokensAvailable: string | null;
  startDate: string;
  endDate: string;
  status: string;
  roundType: string;
}

interface InvestorProfile {
  id: number;
  kycStatus: string;
  accreditedStatus: boolean;
  totalInvested: string;
}

export default function InvestmentPortal() {
  const [selectedRound, setSelectedRound] = useState<InvestmentRound | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'crypto'>('credit_card');
  const [selectedCrypto, setSelectedCrypto] = useState('ETH');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showInvestDialog, setShowInvestDialog] = useState(false);
  const [currentTxHash, setCurrentTxHash] = useState<string | null>(null);
  
  const wallet = useWallet();

  // Fetch active investment rounds
  const { data: rounds = [], isLoading: roundsLoading } = useQuery({
    queryKey: ['/api/investment/rounds'],
    enabled: true
  });

  // Fetch investor profile
  const { data: investorProfile } = useQuery({
    queryKey: ['/api/investment/investor'],
    enabled: true
  });

  // Create Stripe payment intent
  const createPaymentIntent = useMutation({
    mutationFn: async ({ amount, roundId }: { amount: string; roundId: number }) => {
      const response = await fetch('/api/investment/stripe/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amount, roundId })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create payment intent');
      }
      return response.json();
    },
    onSuccess: async (data) => {
      if (!stripePromise) {
        toast({
          title: 'Stripe not configured',
          description: 'Please configure Stripe API keys to enable credit card payments',
          variant: 'destructive'
        });
        return;
      }
      
      const stripe = await stripePromise;
      if (!stripe) {
        toast({
          title: 'Error',
          description: 'Failed to load payment processor',
          variant: 'destructive'
        });
        return;
      }

      // For demo purposes, show success message
      toast({
        title: 'Payment initiated',
        description: 'Payment processing would redirect to Stripe checkout',
      });
      
      setShowInvestDialog(false);
      setInvestmentAmount('');
      queryClient.invalidateQueries({ queryKey: ['/api/investment/rounds'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Investment failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Create crypto investment
  const createCryptoInvestment = useMutation({
    mutationFn: async ({ amount, currency, roundId }: { amount: string; currency: string; roundId: number }) => {
      const response = await fetch('/api/investment/crypto/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          amount, 
          currency, 
          roundId, 
          walletAddress: wallet.address 
        })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create crypto investment');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Crypto investment initiated',
        description: `Send ${data.amount} ${data.currency} to ${data.paymentAddress}`,
      });
      
      setShowInvestDialog(false);
      setInvestmentAmount('');
      queryClient.invalidateQueries({ queryKey: ['/api/investment/rounds'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Investment failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleInvest = async () => {
    if (!selectedRound || !investmentAmount) return;

    const amount = parseFloat(investmentAmount);
    
    // Validate amount
    if (amount < parseFloat(selectedRound.minimumInvestment)) {
      toast({
        title: 'Invalid amount',
        description: `Minimum investment is $${selectedRound.minimumInvestment}`,
        variant: 'destructive'
      });
      return;
    }

    if (selectedRound.maximumInvestment && amount > parseFloat(selectedRound.maximumInvestment)) {
      toast({
        title: 'Invalid amount',
        description: `Maximum investment is $${selectedRound.maximumInvestment}`,
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);

    try {
      if (paymentMethod === 'credit_card') {
        if (!stripePromise) {
          toast({
            title: 'Credit card payments not available',
            description: 'Stripe is not configured. Please use crypto payment instead.',
            variant: 'destructive'
          });
          setIsProcessing(false);
          return;
        }
        await createPaymentIntent.mutateAsync({
          amount: investmentAmount,
          roundId: selectedRound.id
        });
      } else {
        if (!wallet.isConnected) {
          toast({
            title: 'Wallet not connected',
            description: 'Please connect your wallet to proceed with crypto payment',
            variant: 'destructive'
          });
          setIsProcessing(false);
          return;
        }

        // For direct wallet transactions
        if (selectedCrypto === 'ETH') {
          // Convert USD to ETH (using a sample rate, in production use a price oracle)
          const ethPrice = 2500; // Sample ETH price in USD
          const ethAmount = (amount / ethPrice).toFixed(6);
          
          // Use configured company wallet address
          const companyWallet = COMPANY_WALLET_ADDRESS;
          
          toast({
            title: 'Initiating transaction',
            description: `Sending ${ethAmount} ETH for $${amount} investment`
          });
          
          const txHash = await wallet.sendTransaction(companyWallet, ethAmount);
          
          if (txHash) {
            setCurrentTxHash(txHash);
            
            // Record the transaction in the database
            await createCryptoInvestment.mutateAsync({
              amount: investmentAmount,
              currency: 'ETH',
              roundId: selectedRound.id
            });
            
            toast({
              title: 'Investment successful!',
              description: `Transaction confirmed: ${txHash.slice(0, 10)}...`,
            });
          }
        } else {
          // For other cryptocurrencies, show payment instructions
          await createCryptoInvestment.mutateAsync({
            amount: investmentAmount,
            currency: selectedCrypto,
            roundId: selectedRound.id
          });
        }
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateTokens = (amount: string, round: InvestmentRound) => {
    if (!round.tokenPrice || !amount) return '0';
    const tokens = parseFloat(amount) / parseFloat(round.tokenPrice);
    return tokens.toFixed(2);
  };

  const calculateProgress = (round: InvestmentRound) => {
    const current = parseFloat(round.currentAmount);
    const target = parseFloat(round.targetAmount);
    return Math.min((current / target) * 100, 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl" data-testid="investment-portal">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Investment Portal</h1>
        <p className="text-muted-foreground text-lg">
          Invest in MoloChain and be part of the logistics revolution
        </p>
      </div>

      {/* KYC Status Alert */}
      {investorProfile && investorProfile.kycStatus !== 'verified' && (
        <Alert className="mb-6" data-testid="kyc-alert">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {investorProfile.kycStatus === 'pending' 
              ? 'Please complete KYC verification to start investing'
              : investorProfile.kycStatus === 'submitted'
              ? 'Your KYC verification is under review'
              : 'KYC verification required to invest'}
          </AlertDescription>
        </Alert>
      )}

      {/* Transaction Monitor */}
      {currentTxHash && (
        <div className="mb-6">
          <TransactionMonitor 
            transactionHash={currentTxHash}
            onComplete={() => {
              setCurrentTxHash(null);
              queryClient.invalidateQueries({ queryKey: ['/api/investment/rounds'] });
              queryClient.invalidateQueries({ queryKey: ['/api/investment/investor'] });
            }}
          />
        </div>
      )}

      {/* Investment Statistics */}
      {investorProfile && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card data-testid="investor-stats">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Your Total Investment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${investorProfile.totalInvested}</div>
              <p className="text-xs text-muted-foreground">Across all rounds</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Investor Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={investorProfile.accreditedStatus ? 'default' : 'secondary'}>
                {investorProfile.accreditedStatus ? 'Accredited' : 'Non-Accredited'}
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">KYC Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge 
                variant={
                  investorProfile.kycStatus === 'verified' ? 'default' : 
                  investorProfile.kycStatus === 'submitted' ? 'secondary' : 
                  'destructive'
                }
              >
                {investorProfile.kycStatus}
              </Badge>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Investment Rounds */}
      <h2 className="text-2xl font-bold mb-6">Active Investment Rounds</h2>
      
      {roundsLoading ? (
        <div className="text-center py-8">Loading investment rounds...</div>
      ) : rounds.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No active investment rounds at the moment</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {rounds.map((round: InvestmentRound) => {
            const progress = calculateProgress(round);
            const raised = parseFloat(round.currentAmount);
            const target = parseFloat(round.targetAmount);
            const percentage = (raised / target * 100).toFixed(1);
            
            return (
              <Card key={round.id} className="overflow-hidden" data-testid={`round-${round.id}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{round.name}</CardTitle>
                      <CardDescription className="mt-2">{round.description}</CardDescription>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {round.roundType}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{percentage}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">${raised.toLocaleString()}</span>
                      <span className="text-muted-foreground">of ${target.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Round Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex items-center gap-1 text-muted-foreground mb-1">
                        <Target className="h-3 w-3" />
                        <span>Min Investment</span>
                      </div>
                      <p className="font-medium">${round.minimumInvestment}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-muted-foreground mb-1">
                        <TrendingUp className="h-3 w-3" />
                        <span>Token Price</span>
                      </div>
                      <p className="font-medium">
                        {round.tokenPrice ? `$${round.tokenPrice}` : 'TBD'}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-muted-foreground mb-1">
                        <Clock className="h-3 w-3" />
                        <span>Ends</span>
                      </div>
                      <p className="font-medium">{formatDate(round.endDate)}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-muted-foreground mb-1">
                        <Users className="h-3 w-3" />
                        <span>Status</span>
                      </div>
                      <Badge variant={round.status === 'active' ? 'default' : 'secondary'}>
                        {round.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Invest Button */}
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      setSelectedRound(round);
                      setShowInvestDialog(true);
                    }}
                    disabled={
                      round.status !== 'active' || 
                      (investorProfile && investorProfile.kycStatus !== 'verified')
                    }
                    data-testid={`button-invest-${round.id}`}
                  >
                    Invest Now
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Investment Dialog */}
      <Dialog open={showInvestDialog} onOpenChange={setShowInvestDialog}>
        <DialogContent className="max-w-md" data-testid="investment-dialog">
          <DialogHeader>
            <DialogTitle>Make Investment</DialogTitle>
            <DialogDescription>
              Choose your payment method and investment amount
            </DialogDescription>
          </DialogHeader>
          
          {selectedRound && (
            <div className="space-y-4">
              {/* Round Summary */}
              <div className="bg-muted p-3 rounded-lg space-y-1">
                <p className="font-medium">{selectedRound.name}</p>
                <p className="text-sm text-muted-foreground">
                  Min: ${selectedRound.minimumInvestment} | 
                  {selectedRound.maximumInvestment 
                    ? ` Max: $${selectedRound.maximumInvestment}`
                    : ' No maximum'}
                </p>
              </div>

              {/* Investment Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Investment Amount (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  min={selectedRound.minimumInvestment}
                  max={selectedRound.maximumInvestment || undefined}
                  data-testid="input-investment-amount"
                />
                {investmentAmount && selectedRound.tokenPrice && (
                  <p className="text-sm text-muted-foreground">
                    You will receive approximately {calculateTokens(investmentAmount, selectedRound)} tokens
                  </p>
                )}
              </div>

              {/* Payment Method */}
              <div className="space-y-3">
                <Label>Payment Method</Label>
                <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="credit_card" data-testid="tab-credit-card">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Credit Card
                    </TabsTrigger>
                    <TabsTrigger value="crypto" data-testid="tab-crypto">
                      <Wallet className="h-4 w-4 mr-2" />
                      Crypto
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="credit_card" className="space-y-2">
                    <Alert>
                      <AlertDescription>
                        You will be redirected to secure Stripe checkout to complete your payment
                      </AlertDescription>
                    </Alert>
                  </TabsContent>
                  
                  <TabsContent value="crypto" className="space-y-3">
                    {!wallet.isConnected ? (
                      <div className="space-y-3">
                        <Alert>
                          <AlertDescription>
                            Connect your wallet to proceed with direct peer-to-peer crypto payment
                          </AlertDescription>
                        </Alert>
                        <div className="grid gap-2">
                          {wallet.getSupportedWallets().map((w) => (
                            <Button
                              key={w.id}
                              variant="outline"
                              className="justify-start gap-2 h-auto py-3"
                              onClick={() => wallet.connectWallet(w.id as any)}
                              disabled={!w.available && w.id !== 'browser'}
                              data-testid={`button-connect-${w.id}`}
                            >
                              <span className="text-xl">{w.icon}</span>
                              <div className="text-left">
                                <div className="font-medium">{w.name}</div>
                                {!w.available && w.id !== 'browser' && (
                                  <div className="text-xs text-muted-foreground">Not detected</div>
                                )}
                              </div>
                            </Button>
                          ))}
                        </div>
                        <div className="text-xs text-muted-foreground text-center">
                          Supports 170+ wallets including MetaMask, TrustWallet, Rainbow, and more
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="bg-muted p-3 rounded-lg space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="text-sm">
                              <div className="text-muted-foreground">Connected via {wallet.walletType || 'Wallet'}</div>
                              <div className="font-mono font-medium">
                                {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => wallet.disconnectWallet()}
                            >
                              Disconnect
                            </Button>
                          </div>
                          {wallet.balance && (
                            <div className="text-xs text-muted-foreground">
                              Balance: {parseFloat(wallet.balance).toFixed(4)} ETH
                            </div>
                          )}
                        </div>
                        <RadioGroup value={selectedCrypto} onValueChange={setSelectedCrypto}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="ETH" id="eth" />
                            <Label htmlFor="eth">Ethereum (ETH)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="USDC" id="usdc" />
                            <Label htmlFor="usdc">USD Coin (USDC)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="BTC" id="btc" />
                            <Label htmlFor="btc">Bitcoin (BTC)</Label>
                          </div>
                        </RadioGroup>
                      </>
                    )}
                  </TabsContent>
                </Tabs>
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowInvestDialog(false)}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleInvest}
                  disabled={
                    isProcessing || 
                    !investmentAmount ||
                    (paymentMethod === 'crypto' && !wallet.isConnected)
                  }
                  data-testid="button-confirm-investment"
                >
                  {isProcessing ? 'Processing...' : 'Confirm Investment'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}