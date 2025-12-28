import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Wallet,
  Link,
  Shield,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Copy,
  QrCode,
  Smartphone,
  CreditCard,
  Key,
  Globe,
  RefreshCw,
  Settings,
  LogOut,
  TrendingUp,
  DollarSign,
  Activity,
  Lock,
  Unlock,
  ExternalLink,
  Info,
  ChevronRight,
  Zap,
  Users,
  Network
} from "lucide-react";
import { useState } from "react";
import { SiCoinbase, SiTrustpilot, SiBinance } from "react-icons/si";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

interface WalletProvider {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  supported: boolean;
  installed?: boolean;
  networks: string[];
  features: string[];
}

interface ConnectedWallet {
  address: string;
  provider: string;
  balance: {
    molochain: number;
    eth: number;
    usd: number;
  };
  network: string;
  transactions: number;
  nfts: number;
}

const WalletIntegration = () => {
  const [connectedWallet, setConnectedWallet] = useState<ConnectedWallet | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [autoConnect, setAutoConnect] = useState(true);
  const [testMode, setTestMode] = useState(false);
  const { toast } = useToast();

  const walletProviders: WalletProvider[] = [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: <Wallet className="w-8 h-8 text-orange-500" />,
      description: 'Most popular browser extension wallet',
      supported: true,
      installed: true,
      networks: ['Ethereum', 'BSC', 'Polygon', 'Arbitrum', 'Optimism'],
      features: ['Hardware wallet support', 'Mobile app', 'Token swaps', 'NFT display']
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      icon: <Wallet className="w-8 h-8 text-blue-500" />,
      description: 'Connect any mobile wallet via QR code',
      supported: true,
      networks: ['Multi-chain', '170+ wallets'],
      features: ['QR code connection', 'Mobile-first', 'Session management', 'Deep linking']
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      icon: <SiCoinbase className="w-8 h-8 text-blue-600" />,
      description: 'Self-custody wallet from Coinbase',
      supported: true,
      installed: false,
      networks: ['Ethereum', 'Polygon', 'Arbitrum', 'Optimism', 'Base'],
      features: ['Exchange integration', 'ENS support', 'DApp browser', 'Cloud backup']
    },
    {
      id: 'trustwallet',
      name: 'Trust Wallet',
      icon: <SiTrustpilot className="w-8 h-8 text-blue-400" />,
      description: 'Official Binance mobile wallet',
      supported: true,
      networks: ['BSC', 'Ethereum', '70+ blockchains'],
      features: ['Built-in DEX', 'Staking', 'DApp browser', 'NFT storage']
    },
    {
      id: 'binance',
      name: 'Binance Chain Wallet',
      icon: <SiBinance className="w-8 h-8 text-yellow-500" />,
      description: 'Official Binance Smart Chain wallet',
      supported: true,
      installed: false,
      networks: ['BSC', 'Ethereum'],
      features: ['Cross-chain swaps', 'Binance Bridge', 'Staking', 'Hardware wallet']
    },
    {
      id: 'ledger',
      name: 'Ledger',
      icon: <CreditCard className="w-8 h-8 text-gray-400" />,
      description: 'Hardware wallet for maximum security',
      supported: false,
      networks: ['All major networks'],
      features: ['Cold storage', 'Bluetooth connectivity', 'Mobile app', 'Recovery phrase']
    }
  ];

  const simulateConnect = (providerId: string) => {
    setIsConnecting(true);
    setSelectedProvider(providerId);

    setTimeout(() => {
      const provider = walletProviders.find(p => p.id === providerId);
      setConnectedWallet({
        address: '0x7abe4dB700cfAA83286272FDEc7299E084631a8F',
        provider: provider?.name || 'Unknown',
        balance: {
          molochain: 125000.50,
          eth: 3.847,
          usd: 134892.38
        },
        network: 'BSC Mainnet',
        transactions: 847,
        nfts: 23
      });
      setIsConnecting(false);
      toast({
        title: "Wallet Connected",
        description: `Successfully connected to ${provider?.name}`,
      });
    }, 2000);
  };

  const disconnect = () => {
    setConnectedWallet(null);
    setSelectedProvider(null);
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  const copyAddress = () => {
    if (connectedWallet) {
      navigator.clipboard.writeText(connectedWallet.address);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <Badge className="mb-4" variant="outline">
              <Wallet className="w-3 h-3 mr-1" /> Wallet Integration
            </Badge>
            <h1 className="text-4xl font-bold mb-4">Connect Your Wallet</h1>
            <p className="text-muted-foreground text-lg">
              Connect your crypto wallet to access MOLOCHAIN tokens, participate in DeFi, 
              and manage your blockchain assets securely.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {connectedWallet ? (
          /* Connected State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-6xl mx-auto"
          >
            <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent mb-6">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Connected with {connectedWallet.provider}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-mono">{formatAddress(connectedWallet.address)}</h3>
                        <Button size="sm" variant="ghost" onClick={copyAddress}>
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" asChild>
                          <a href={`https://bscscan.com/address/${connectedWallet.address}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      </div>
                      <Badge variant="outline">{connectedWallet.network}</Badge>
                    </div>
                  </div>
                  <Button variant="destructive" onClick={disconnect}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Disconnect
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Wallet Dashboard */}
            <Tabs defaultValue="balance" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="balance">Balance</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>

              {/* Balance Tab */}
              <TabsContent value="balance" className="mt-6">
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">MOLOCHAIN Balance</span>
                        <Badge className="bg-yellow-500/10 text-yellow-500">Native Token</Badge>
                      </div>
                      <p className="text-3xl font-bold mb-1">{connectedWallet.balance.molochain.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">≈ ${(connectedWallet.balance.molochain * 0.75).toLocaleString()}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">ETH Balance</span>
                        <Activity className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <p className="text-3xl font-bold mb-1">{connectedWallet.balance.eth}</p>
                      <p className="text-sm text-muted-foreground">≈ ${(connectedWallet.balance.eth * 2800).toLocaleString()}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Total Value</span>
                        <DollarSign className="w-4 h-4 text-green-500" />
                      </div>
                      <p className="text-3xl font-bold mb-1">${connectedWallet.balance.usd.toLocaleString()}</p>
                      <p className="text-sm text-green-500">
                        <TrendingUp className="w-3 h-3 inline mr-1" />
                        +12.5% (24h)
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>
                      Manage your MOLOCHAIN tokens and interact with the platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-4 gap-4">
                      <Button className="w-full" variant="outline">
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Send Tokens
                      </Button>
                      <Button className="w-full" variant="outline">
                        <QrCode className="w-4 h-4 mr-2" />
                        Receive
                      </Button>
                      <Button className="w-full" variant="outline">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Swap
                      </Button>
                      <Button className="w-full" variant="outline">
                        <Zap className="w-4 h-4 mr-2" />
                        Bridge
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Your recent transactions and interactions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { type: 'Received', amount: '+5,000 MOLOCHAIN', from: '0x3f5CE...8D3e', time: '2 hours ago', status: 'completed' },
                        { type: 'Sent', amount: '-1,250 MOLOCHAIN', to: '0xA892...34Bc', time: '5 hours ago', status: 'completed' },
                        { type: 'Swap', amount: '0.5 ETH → 2,500 MOLOCHAIN', time: '1 day ago', status: 'completed' },
                        { type: 'Stake', amount: '10,000 MOLOCHAIN', time: '3 days ago', status: 'active' },
                        { type: 'Bridge', amount: '5,000 MOLOCHAIN', from: 'Ethereum → BSC', time: '5 days ago', status: 'completed' },
                      ].map((tx, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              tx.type === 'Received' ? 'bg-green-500/10' :
                              tx.type === 'Sent' ? 'bg-red-500/10' :
                              tx.type === 'Swap' ? 'bg-blue-500/10' :
                              tx.type === 'Stake' ? 'bg-purple-500/10' :
                              'bg-yellow-500/10'
                            }`}>
                              {tx.type === 'Received' ? <ArrowRight className="w-5 h-5 text-green-500 rotate-45" /> :
                               tx.type === 'Sent' ? <ArrowRight className="w-5 h-5 text-red-500 -rotate-45" /> :
                               tx.type === 'Swap' ? <RefreshCw className="w-5 h-5 text-blue-500" /> :
                               tx.type === 'Stake' ? <Lock className="w-5 h-5 text-purple-500" /> :
                               <Network className="w-5 h-5 text-yellow-500" />}
                            </div>
                            <div>
                              <p className="font-medium">{tx.type}</p>
                              <p className="text-sm text-muted-foreground">
                                {tx.from || tx.to || tx.amount}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{tx.type !== 'Bridge' && tx.type !== 'Swap' ? tx.amount : ''}</p>
                            <p className="text-xs text-muted-foreground">{tx.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Wallet Settings</CardTitle>
                    <CardDescription>
                      Configure your wallet preferences and connections
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="auto-connect">Auto-connect</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically connect when you visit the site
                        </p>
                      </div>
                      <Switch
                        id="auto-connect"
                        checked={autoConnect}
                        onCheckedChange={setAutoConnect}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="test-mode">Test Mode</Label>
                        <p className="text-sm text-muted-foreground">
                          Use testnet for development and testing
                        </p>
                      </div>
                      <Switch
                        id="test-mode"
                        checked={testMode}
                        onCheckedChange={setTestMode}
                      />
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-3">Default Network</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {['BSC Mainnet', 'Ethereum', 'Polygon', 'Arbitrum', 'Avalanche', 'Optimism'].map(network => (
                          <Button
                            key={network}
                            variant={connectedWallet.network === network ? 'default' : 'outline'}
                            size="sm"
                            className="w-full"
                          >
                            {network}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>
                      Manage your wallet security and permissions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Alert>
                        <Shield className="w-4 h-4" />
                        <AlertDescription>
                          Your wallet is secured with hardware authentication and encryption
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <Lock className="w-5 h-5 text-green-500" />
                            <div>
                              <p className="font-medium">Transaction Signing</p>
                              <p className="text-sm text-muted-foreground">Required for all transactions</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-green-500/10">Active</Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <Key className="w-5 h-5 text-blue-500" />
                            <div>
                              <p className="font-medium">Hardware Wallet</p>
                              <p className="text-sm text-muted-foreground">Ledger Nano X connected</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-blue-500/10">Connected</Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-purple-500" />
                            <div>
                              <p className="font-medium">2FA Authentication</p>
                              <p className="text-sm text-muted-foreground">Additional security layer</p>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <h4 className="font-medium mb-3">Connected DApps</h4>
                        <div className="space-y-2">
                          {['MoloChain Platform', 'MOLOCHAIN DEX', 'Staking Portal'].map(dapp => (
                            <div key={dapp} className="flex items-center justify-between p-2 rounded border">
                              <span className="text-sm">{dapp}</span>
                              <Button size="sm" variant="ghost">
                                Revoke
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        ) : (
          /* Disconnected State */
          <div className="max-w-6xl mx-auto">
            {/* Wallet Providers Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {walletProviders.map((provider) => (
                <motion.div
                  key={provider.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <Card 
                    className={`relative overflow-hidden transition-all duration-300 ${
                      provider.supported 
                        ? 'hover:shadow-lg hover:scale-105 cursor-pointer' 
                        : 'opacity-60'
                    } ${selectedProvider === provider.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => provider.supported && simulateConnect(provider.id)}
                  >
                    {!provider.supported && (
                      <Badge className="absolute top-2 right-2" variant="secondary">
                        Coming Soon
                      </Badge>
                    )}
                    {provider.installed && (
                      <Badge className="absolute top-2 right-2" variant="outline">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Installed
                      </Badge>
                    )}
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        {provider.icon}
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{provider.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {provider.description}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Supported Networks</p>
                          <div className="flex flex-wrap gap-1">
                            {provider.networks.slice(0, 3).map(network => (
                              <Badge key={network} variant="secondary" className="text-xs">
                                {network}
                              </Badge>
                            ))}
                            {provider.networks.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{provider.networks.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Features</p>
                          <div className="flex flex-wrap gap-1">
                            {provider.features.slice(0, 2).map(feature => (
                              <span key={feature} className="text-xs text-muted-foreground">
                                • {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {isConnecting && selectedProvider === provider.id && (
                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                          <div className="flex items-center gap-2">
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            <span>Connecting...</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Info Section */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Why Connect Your Wallet?</CardTitle>
                  <CardDescription>
                    Unlock the full potential of the MOLOCHAIN ecosystem
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Hold & Trade MOLOCHAIN Tokens</p>
                        <p className="text-sm text-muted-foreground">
                          Buy, sell, and manage your MOLOCHAIN tokens directly
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Participate in DeFi</p>
                        <p className="text-sm text-muted-foreground">
                          Access staking, liquidity pools, and yield farming
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">NFT Marketplace</p>
                        <p className="text-sm text-muted-foreground">
                          Trade tokenized logistics assets and collectibles
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Governance Participation</p>
                        <p className="text-sm text-muted-foreground">
                          Vote on proposals and shape the platform's future
                        </p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 border-blue-500/20">
                <CardHeader>
                  <CardTitle>Security Best Practices</CardTitle>
                  <CardDescription>
                    Keep your wallet and assets safe
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Alert>
                      <AlertCircle className="w-4 h-4" />
                      <AlertDescription>
                        Never share your seed phrase or private keys with anyone
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      <TooltipProvider>
                        {[
                          { icon: Shield, text: 'Always verify the website URL before connecting' },
                          { icon: Lock, text: 'Use hardware wallets for large holdings' },
                          { icon: Key, text: 'Enable 2FA where available' },
                          { icon: RefreshCw, text: 'Keep your wallet software updated' }
                        ].map((tip, idx) => (
                          <UITooltip key={idx}>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-help">
                                <tip.icon className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">{tip.text}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Click to learn more about this security practice</p>
                            </TooltipContent>
                          </UITooltip>
                        ))}
                      </TooltipProvider>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Help Section */}
            <Card className="mt-6">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">New to Crypto Wallets?</p>
                      <p className="text-sm text-muted-foreground">
                        Learn how to set up and use a crypto wallet with our comprehensive guide
                      </p>
                    </div>
                  </div>
                  <Button variant="outline">
                    View Guide
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletIntegration;