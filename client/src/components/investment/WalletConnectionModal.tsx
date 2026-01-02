import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Wallet, 
  CreditCard, 
  Coins, 
  ArrowRight,
  Check,
  ExternalLink,
  Shield,
  Zap,
  Globe,
  Lock
} from 'lucide-react';

interface WalletOption {
  id: string;
  name: string;
  icon: string;
  type: 'browser' | 'mobile' | 'hardware';
  popular?: boolean;
  chainSupport: string[];
}

const walletOptions: WalletOption[] = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '🦊',
    type: 'browser',
    popular: true,
    chainSupport: ['Ethereum', 'Polygon', 'BSC', 'Avalanche']
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: '🔗',
    type: 'mobile',
    popular: true,
    chainSupport: ['Multi-chain']
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '💙',
    type: 'browser',
    popular: true,
    chainSupport: ['Ethereum', 'Polygon', 'Optimism', 'Arbitrum']
  },
  {
    id: 'trust',
    name: 'Trust Wallet',
    icon: '🛡️',
    type: 'mobile',
    chainSupport: ['Multi-chain']
  },
  {
    id: 'ledger',
    name: 'Ledger',
    icon: '📱',
    type: 'hardware',
    chainSupport: ['Multi-chain']
  },
  {
    id: 'trezor',
    name: 'Trezor',
    icon: '🔐',
    type: 'hardware',
    chainSupport: ['Multi-chain']
  }
];

interface WalletConnectionModalProps {
  open: boolean;
  onClose: () => void;
  onConnect: (walletType: string, amount?: number) => void;
  minInvestment: number;
  maxInvestment?: number;
}

export default function WalletConnectionModal({
  open,
  onClose,
  onConnect,
  minInvestment,
  maxInvestment
}: WalletConnectionModalProps) {
  const { toast } = useToast();
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'crypto' | 'fiat'>('crypto');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    if (!selectedWallet) return;
    
    setIsConnecting(true);
    // Simulate connection delay
    setTimeout(() => {
      onConnect(selectedWallet, parseFloat(investmentAmount) || minInvestment);
      setIsConnecting(false);
      onClose();
    }, 1500);
  };

  const isValidAmount = () => {
    const amount = parseFloat(investmentAmount);
    if (isNaN(amount)) return false;
    if (amount < minInvestment) return false;
    if (maxInvestment && amount > maxInvestment) return false;
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            Connect & Invest
          </DialogTitle>
          <DialogDescription>
            Choose your preferred payment method and connect your wallet to invest
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Investment Amount */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Investment Amount (USD)</label>
            <div className="relative">
              <Input
                type="number"
                placeholder={`Minimum: $${minInvestment.toLocaleString()}`}
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                className="pl-8"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
            </div>
            {investmentAmount && !isValidAmount() && (
              <p className="text-sm text-red-500">
                Amount must be between ${minInvestment.toLocaleString()} 
                {maxInvestment && ` and $${maxInvestment.toLocaleString()}`}
              </p>
            )}
          </div>

          {/* Payment Method Tabs */}
          <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="crypto" className="flex items-center gap-2">
                <Coins className="h-4 w-4" />
                Cryptocurrency
              </TabsTrigger>
              <TabsTrigger value="fiat" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Credit/Debit Card
              </TabsTrigger>
            </TabsList>

            <TabsContent value="crypto" className="space-y-4">
              {/* Security Badge */}
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="text-sm text-green-700 dark:text-green-400">
                  Secure, decentralized payment with lower fees (0.5% - 2%)
                </span>
              </div>

              {/* Wallet Selection */}
              <div className="space-y-3">
                <p className="text-sm font-medium">Select Wallet</p>
                
                {/* Popular Wallets */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Popular</p>
                  <div className="grid grid-cols-3 gap-2">
                    {walletOptions
                      .filter(w => w.popular)
                      .map(wallet => (
                        <Card
                          key={wallet.id}
                          className={`cursor-pointer transition-all ${
                            selectedWallet === wallet.id 
                              ? 'border-primary ring-2 ring-primary/20' 
                              : 'hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedWallet(wallet.id)}
                        >
                          <CardContent className="p-3">
                            <div className="flex flex-col items-center gap-2">
                              <span className="text-2xl">{wallet.icon}</span>
                              <span className="text-sm font-medium">{wallet.name}</span>
                              {selectedWallet === wallet.id && (
                                <Check className="h-4 w-4 text-primary" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>

                {/* Other Wallets */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Other Options</p>
                  <div className="grid grid-cols-3 gap-2">
                    {walletOptions
                      .filter(w => !w.popular)
                      .map(wallet => (
                        <Card
                          key={wallet.id}
                          className={`cursor-pointer transition-all ${
                            selectedWallet === wallet.id 
                              ? 'border-primary ring-2 ring-primary/20' 
                              : 'hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedWallet(wallet.id)}
                        >
                          <CardContent className="p-3">
                            <div className="flex flex-col items-center gap-2">
                              <span className="text-2xl">{wallet.icon}</span>
                              <span className="text-sm font-medium">{wallet.name}</span>
                              {selectedWallet === wallet.id && (
                                <Check className="h-4 w-4 text-primary" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span>Instant Settlement</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-blue-500" />
                  <span>Global Access</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Lock className="h-4 w-4 text-green-500" />
                  <span>Secure & Private</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Coins className="h-4 w-4 text-purple-500" />
                  <span>170+ Wallets Supported</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="fiat" className="space-y-4">
              {/* Stripe Notice */}
              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-blue-700 dark:text-blue-400">
                  Secure payment via Stripe (2.9% + $0.30 fee)
                </span>
              </div>

              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-muted rounded-full">
                      <CreditCard className="h-8 w-8" />
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="font-semibold">Card Payment</h3>
                      <p className="text-sm text-muted-foreground">
                        Process payment securely with Stripe
                      </p>
                    </div>
                    <Button 
                      className="w-full"
                      disabled={!isValidAmount()}
                      onClick={() => {
                        // Would integrate with Stripe here
                        toast({
                          title: "Payment Processing",
                          description: "Stripe payment integration will be available soon.",
                        });
                      }}
                    >
                      Continue with Card
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          {paymentMethod === 'crypto' && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConnect}
                disabled={!selectedWallet || !isValidAmount() || isConnecting}
                className="flex-1"
              >
                {isConnecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Connecting...
                  </>
                ) : (
                  <>
                    Connect & Invest
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}