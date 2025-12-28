import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowRight,
  ArrowLeftRight,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  Network,
  DollarSign,
  Activity,
  TrendingUp,
  Zap,
  Lock,
  Globe,
  Coins,
  Link2,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Wallet,
  Settings,
  History,
  BarChart3,
  Filter,
  Search,
  Download,
  Copy,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TokenBridge = () => {
  const [fromNetwork, setFromNetwork] = useState('ethereum');
  const [toNetwork, setToNetwork] = useState('polygon');
  const [selectedToken, setSelectedToken] = useState('MOLOCHAIN');
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [estimatedFee, setEstimatedFee] = useState(12.50);
  const [estimatedTime, setEstimatedTime] = useState(15);
  const [addressCopied, setAddressCopied] = useState(false);

  const networks = [
    {
      id: 'ethereum',
      name: 'Ethereum',
      icon: '⟠',
      chainId: 1,
      avgGas: '$15.00',
      bridgeTime: '15 mins',
      tvl: '$2.5B',
      volume24h: '$450M',
      status: 'active',
      congestion: 'medium'
    },
    {
      id: 'polygon',
      name: 'Polygon',
      icon: '🟣',
      chainId: 137,
      avgGas: '$0.05',
      bridgeTime: '2 mins',
      tvl: '$850M',
      volume24h: '$125M',
      status: 'active',
      congestion: 'low'
    },
    {
      id: 'bsc',
      name: 'BSC',
      icon: '🔶',
      chainId: 56,
      avgGas: '$0.50',
      bridgeTime: '5 mins',
      tvl: '$1.2B',
      volume24h: '$280M',
      status: 'active',
      congestion: 'low'
    },
    {
      id: 'arbitrum',
      name: 'Arbitrum',
      icon: '🔷',
      chainId: 42161,
      avgGas: '$2.00',
      bridgeTime: '10 mins',
      tvl: '$650M',
      volume24h: '$95M',
      status: 'active',
      congestion: 'low'
    },
    {
      id: 'optimism',
      name: 'Optimism',
      icon: '🔴',
      chainId: 10,
      avgGas: '$1.50',
      bridgeTime: '10 mins',
      tvl: '$480M',
      volume24h: '$75M',
      status: 'active',
      congestion: 'low'
    },
    {
      id: 'avalanche',
      name: 'Avalanche',
      icon: '🔺',
      chainId: 43114,
      avgGas: '$1.00',
      bridgeTime: '5 mins',
      tvl: '$380M',
      volume24h: '$65M',
      status: 'active',
      congestion: 'low'
    }
  ];

  const supportedTokens = [
    {
      symbol: 'MOLOCHAIN',
      name: 'MoloChain Token',
      icon: '🔷',
      balance: {
        ethereum: 50000,
        polygon: 100000,
        bsc: 75000,
        arbitrum: 25000,
        optimism: 15000,
        avalanche: 30000
      },
      price: 5.00,
      bridgeable: true
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      icon: '⟠',
      balance: {
        ethereum: 25.5,
        polygon: 10.2,
        bsc: 5.8,
        arbitrum: 15.3,
        optimism: 8.7,
        avalanche: 3.2
      },
      price: 3600,
      bridgeable: true
    },
    {
      symbol: 'USDT',
      name: 'Tether USD',
      icon: '💵',
      balance: {
        ethereum: 25000,
        polygon: 50000,
        bsc: 75000,
        arbitrum: 30000,
        optimism: 20000,
        avalanche: 15000
      },
      price: 1.00,
      bridgeable: true
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      icon: '💲',
      balance: {
        ethereum: 30000,
        polygon: 45000,
        bsc: 20000,
        arbitrum: 35000,
        optimism: 25000,
        avalanche: 18000
      },
      price: 1.00,
      bridgeable: true
    }
  ];

  const bridgeHistory = [
    {
      id: '0x1234...5678',
      from: 'Ethereum',
      to: 'Polygon',
      token: 'MOLOCHAIN',
      amount: '10,000',
      value: '$50,000',
      status: 'completed',
      time: '2 hours ago',
      txHash: '0x123456789abcdef',
      fee: '$12.50'
    },
    {
      id: '0x2345...6789',
      from: 'BSC',
      to: 'Arbitrum',
      token: 'ETH',
      amount: '5.5',
      value: '$19,800',
      status: 'completed',
      time: '5 hours ago',
      txHash: '0x23456789abcdef0',
      fee: '$8.75'
    },
    {
      id: '0x3456...7890',
      from: 'Polygon',
      to: 'Avalanche',
      token: 'USDT',
      amount: '25,000',
      value: '$25,000',
      status: 'processing',
      time: '30 mins ago',
      txHash: '0x3456789abcdef01',
      fee: '$5.25'
    },
    {
      id: '0x4567...8901',
      from: 'Ethereum',
      to: 'Optimism',
      token: 'USDC',
      amount: '15,000',
      value: '$15,000',
      status: 'completed',
      time: '1 day ago',
      txHash: '0x456789abcdef012',
      fee: '$15.00'
    }
  ];

  const bridgeStats = [
    { label: 'Total Volume Bridged', value: '$12.5M', change: '+23.4%', icon: DollarSign },
    { label: 'Total Transactions', value: '3,456', change: '+15.2%', icon: Activity },
    { label: 'Active Bridges', value: '6', change: '0%', icon: Link2 },
    { label: 'Avg Bridge Time', value: '8 mins', change: '-12.5%', icon: Clock }
  ];

  const liquidityPools = [
    {
      pair: 'ETH-POLYGON',
      liquidity: '$450M',
      apy: '8.5%',
      volume24h: '$85M',
      utilization: 78
    },
    {
      pair: 'BSC-POLYGON',
      liquidity: '$280M',
      apy: '12.3%',
      volume24h: '$62M',
      utilization: 65
    },
    {
      pair: 'ETH-ARBITRUM',
      liquidity: '$380M',
      apy: '9.8%',
      volume24h: '$72M',
      utilization: 82
    },
    {
      pair: 'POLYGON-AVALANCHE',
      liquidity: '$125M',
      apy: '15.2%',
      volume24h: '$28M',
      utilization: 45
    }
  ];

  const handleBridge = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
    }, 3000);
  };

  const swapNetworks = () => {
    const temp = fromNetwork;
    setFromNetwork(toNetwork);
    setToNetwork(temp);
  };

  const getNetworkById = (id: string) => networks.find(n => n.id === id);
  const getTokenBalance = (token: string, network: string) => {
    const tokenData = supportedTokens.find(t => t.symbol === token);
    return tokenData?.balance[network as keyof typeof tokenData.balance] || 0;
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setAddressCopied(true);
    setTimeout(() => setAddressCopied(false), 2000);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const getCongestionColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500';
      case 'processing': return 'text-yellow-500';
      case 'failed': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Cross-Chain Token Bridge
            </h1>
            <p className="text-muted-foreground mt-2">
              Transfer tokens seamlessly between multiple blockchain networks
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button>
              <Wallet className="h-4 w-4 mr-2" />
              Connect Wallet
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {bridgeStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className={cn(
                    "text-sm flex items-center gap-1 mt-1",
                    stat.change.startsWith('+') ? 'text-green-500' : 
                    stat.change.startsWith('-') ? 'text-red-500' : 'text-gray-500'
                  )}>
                    <TrendingUp className="h-3 w-3" />
                    {stat.change}
                  </div>
                </div>
                <stat.icon className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Bridge Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Bridge Tokens</CardTitle>
              <CardDescription>Select networks and enter the amount to bridge</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Network Selection */}
              <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
                <div className="space-y-2">
                  <Label>From Network</Label>
                  <Select value={fromNetwork} onValueChange={setFromNetwork}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {networks.map((network) => (
                        <SelectItem key={network.id} value={network.id}>
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{network.icon}</span>
                            <span>{network.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="text-xs text-muted-foreground">
                    Balance: {getTokenBalance(selectedToken, fromNetwork).toLocaleString()} {selectedToken}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={swapNetworks}
                  className="mt-6"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                </Button>

                <div className="space-y-2">
                  <Label>To Network</Label>
                  <Select value={toNetwork} onValueChange={setToNetwork}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {networks.filter(n => n.id !== fromNetwork).map((network) => (
                        <SelectItem key={network.id} value={network.id}>
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{network.icon}</span>
                            <span>{network.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="text-xs text-muted-foreground">
                    Balance: {getTokenBalance(selectedToken, toNetwork).toLocaleString()} {selectedToken}
                  </div>
                </div>
              </div>

              {/* Token and Amount */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Token</Label>
                  <Select value={selectedToken} onValueChange={setSelectedToken}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {supportedTokens.map((token) => (
                        <SelectItem key={token.symbol} value={token.symbol}>
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{token.icon}</span>
                              <span>{token.symbol}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {token.name}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Amount</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pr-16"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-7 text-xs"
                      onClick={() => setAmount(getTokenBalance(selectedToken, fromNetwork).toString())}
                    >
                      MAX
                    </Button>
                  </div>
                  {amount && (
                    <div className="text-sm text-muted-foreground">
                      ≈ {formatNumber(parseFloat(amount) * (supportedTokens.find(t => t.symbol === selectedToken)?.price || 0))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bridge Details */}
              <Card className="bg-muted/50">
                <CardContent className="pt-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Estimated Fee</span>
                    <span className="font-medium">{formatNumber(estimatedFee)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Estimated Time</span>
                    <span className="font-medium">~{estimatedTime} minutes</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Network Congestion</span>
                    <span className={cn("font-medium capitalize", getCongestionColor(getNetworkById(fromNetwork)?.congestion || 'low'))}>
                      {getNetworkById(fromNetwork)?.congestion}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-medium">You Will Receive</span>
                    <span className="font-bold text-lg">
                      {amount ? (parseFloat(amount) - 0.1).toFixed(2) : '0.00'} {selectedToken}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Action Button */}
              <Button
                className="w-full"
                size="lg"
                onClick={handleBridge}
                disabled={!amount || parseFloat(amount) <= 0 || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing Bridge...
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Bridge Tokens
                  </>
                )}
              </Button>

              {/* Security Notice */}
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Your tokens are secured by multi-signature smart contracts and undergo thorough validation. 
                  Bridge transactions typically complete within {estimatedTime} minutes.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* Network Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Network Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {networks.slice(0, 4).map((network) => (
                <div key={network.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{network.icon}</span>
                      <span className="font-medium">{network.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Chain {network.chainId}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>Gas: {network.avgGas}</div>
                    <div>Time: {network.bridgeTime}</div>
                  </div>
                  <Progress value={network.congestion === 'low' ? 25 : network.congestion === 'medium' ? 60 : 90} className="h-1" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bridge Liquidity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {liquidityPools.map((pool) => (
                <div key={pool.pair} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{pool.pair}</span>
                    <Badge variant="outline" className="text-xs text-green-500">
                      {pool.apy} APY
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    TVL: {pool.liquidity} • Vol: {pool.volume24h}
                  </div>
                  <Progress value={pool.utilization} className="h-1" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bridge History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Bridge History</CardTitle>
              <CardDescription>Your recent bridge transactions</CardDescription>
            </div>
            <div className="flex gap-2">
              <Input placeholder="Search transactions..." className="w-[200px]" />
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {bridgeHistory.map((tx) => (
              <div key={tx.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Network className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{tx.from}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{tx.to}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-semibold">{tx.amount} {tx.token}</div>
                      <div className="text-sm text-muted-foreground">{tx.value}</div>
                    </div>
                    <Badge variant={tx.status === 'completed' ? 'default' : 'secondary'} className={getStatusColor(tx.status)}>
                      {tx.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{tx.time}</span>
                    <span>Fee: {tx.fee}</span>
                    <button
                      onClick={() => copyAddress(tx.txHash)}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      {tx.id}
                      {addressCopied ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TokenBridge;