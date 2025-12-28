import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  ArrowUpDown,
  Settings,
  Info,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Wallet,
  RefreshCw,
  ChevronDown,
  Shield,
  Zap,
  AlertCircle,
  CheckCircle,
  Activity,
  BarChart3,
  Coins,
  ArrowRight,
  Flame,
  Droplet,
  Lock,
  Unlock,
  Timer,
  Award,
  Target,
  Gift,
  Plus,
  ExternalLink
} from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface Token {
  symbol: string;
  name: string;
  balance: number;
  price: number;
  change24h: number;
  logo?: string;
  address: string;
}

interface Pool {
  pair: string;
  tvl: number;
  volume24h: number;
  apy: number;
  myLiquidity?: number;
  rewards?: number;
}

interface Transaction {
  type: 'swap' | 'add' | 'remove';
  tokenA: string;
  tokenB: string;
  amountA: number;
  amountB: number;
  timestamp: string;
  status: 'success' | 'pending' | 'failed';
  txHash: string;
}

const TokenSwap = () => {
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [isSwapping, setIsSwapping] = useState(false);
  const { toast } = useToast();

  // Mock token data
  const tokens: Token[] = [
    { symbol: 'MOLOCHAIN', name: 'MOLOCHAIN Token', balance: 10000, price: 1.42, change24h: 5.2, address: '0x742d...' },
    { symbol: 'USDT', name: 'Tether USD', balance: 5000, price: 1.00, change24h: 0.01, address: '0x8f3a...' },
    { symbol: 'ETH', name: 'Ethereum', balance: 2.5, price: 2350, change24h: -2.1, address: '0x3d2c...' },
    { symbol: 'BTC', name: 'Wrapped Bitcoin', balance: 0.15, price: 45000, change24h: 3.4, address: '0x9e8c...' },
    { symbol: 'BNB', name: 'Binance Coin', balance: 10, price: 320, change24h: 1.8, address: '0x2f3e...' },
  ];

  // Mock liquidity pools
  const liquidityPools: Pool[] = [
    { pair: 'MOLOCHAIN/USDT', tvl: 12500000, volume24h: 2847293, apy: 24.5, myLiquidity: 10000, rewards: 125 },
    { pair: 'MOLOCHAIN/ETH', tvl: 8928374, volume24h: 1928374, apy: 31.2, myLiquidity: 5000, rewards: 89 },
    { pair: 'MOLOCHAIN/BTC', tvl: 15928374, volume24h: 3928374, apy: 28.7, myLiquidity: 0, rewards: 0 },
    { pair: 'ETH/USDT', tvl: 25928374, volume24h: 8928374, apy: 18.5, myLiquidity: 2500, rewards: 45 },
    { pair: 'BTC/USDT', tvl: 45928374, volume24h: 12928374, apy: 15.2, myLiquidity: 0, rewards: 0 },
  ];

  // Mock recent transactions
  const recentTransactions: Transaction[] = [
    {
      type: 'swap',
      tokenA: 'MOLOCHAIN',
      tokenB: 'USDT',
      amountA: 1000,
      amountB: 1420,
      timestamp: '2 minutes ago',
      status: 'success',
      txHash: '0x3f8a...2c9d'
    },
    {
      type: 'add',
      tokenA: 'MOLOCHAIN',
      tokenB: 'ETH',
      amountA: 5000,
      amountB: 3.02,
      timestamp: '15 minutes ago',
      status: 'success',
      txHash: '0x9e2f...8d3a'
    },
    {
      type: 'swap',
      tokenA: 'ETH',
      tokenB: 'USDT',
      amountA: 1.5,
      amountB: 3525,
      timestamp: '30 minutes ago',
      status: 'success',
      txHash: '0x2c8e...9f3d'
    },
  ];

  const handleSwap = () => {
    if (!fromToken || !toToken || !fromAmount) {
      toast({
        title: "Invalid Input",
        description: "Please select tokens and enter amount",
        variant: "destructive"
      });
      return;
    }

    setIsSwapping(true);
    
    setTimeout(() => {
      setIsSwapping(false);
      toast({
        title: "Swap Successful",
        description: `Swapped ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}`,
      });
      setFromAmount('');
      setToAmount('');
    }, 2000);
  };

  const calculateOutput = (input: string) => {
    if (!fromToken || !toToken || !input) return '';
    const inputNum = parseFloat(input);
    const output = (inputNum * fromToken.price / toToken.price).toFixed(6);
    return output;
  };

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    setToAmount(calculateOutput(value));
  };

  const switchTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    const tempAmount = fromAmount;
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500/10 to-green-500/10 border-b">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <Badge className="mb-4" variant="outline">
              <ArrowUpDown className="w-3 h-3 mr-1" /> DEX
            </Badge>
            <h1 className="text-4xl font-bold mb-4">Token Swap & Liquidity</h1>
            <p className="text-muted-foreground text-lg">
              Swap tokens instantly with minimal fees, provide liquidity to earn rewards, 
              and participate in the MOLOCHAIN DeFi ecosystem.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">24h Volume</p>
                  <p className="text-lg font-bold">$28.4M</p>
                </div>
                <Activity className="w-4 h-4 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total TVL</p>
                  <p className="text-lg font-bold">$112.5M</p>
                </div>
                <DollarSign className="w-4 h-4 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Active Pools</p>
                  <p className="text-lg font-bold">47</p>
                </div>
                <Droplet className="w-4 h-4 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Avg APY</p>
                  <p className="text-lg font-bold">23.8%</p>
                </div>
                <TrendingUp className="w-4 h-4 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="swap" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="swap">Swap</TabsTrigger>
            <TabsTrigger value="liquidity">Liquidity</TabsTrigger>
            <TabsTrigger value="pools">Pools</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Swap Tab */}
          <TabsContent value="swap" className="mt-6">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Swap Tokens</CardTitle>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Transaction Settings</DialogTitle>
                          <DialogDescription>
                            Adjust slippage tolerance and transaction deadline
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <div>
                            <Label>Slippage Tolerance</Label>
                            <div className="flex items-center gap-2 mt-2">
                              <Button
                                size="sm"
                                variant={slippage === 0.1 ? 'default' : 'outline'}
                                onClick={() => setSlippage(0.1)}
                              >
                                0.1%
                              </Button>
                              <Button
                                size="sm"
                                variant={slippage === 0.5 ? 'default' : 'outline'}
                                onClick={() => setSlippage(0.5)}
                              >
                                0.5%
                              </Button>
                              <Button
                                size="sm"
                                variant={slippage === 1.0 ? 'default' : 'outline'}
                                onClick={() => setSlippage(1.0)}
                              >
                                1.0%
                              </Button>
                              <Input
                                type="number"
                                placeholder="Custom"
                                className="w-24"
                                value={slippage}
                                onChange={(e) => setSlippage(parseFloat(e.target.value))}
                              />
                            </div>
                          </div>
                          <div>
                            <Label>Transaction Deadline</Label>
                            <Select defaultValue="20">
                              <SelectTrigger className="mt-2">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="10">10 minutes</SelectItem>
                                <SelectItem value="20">20 minutes</SelectItem>
                                <SelectItem value="30">30 minutes</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* From Token */}
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Label>From</Label>
                        <span className="text-xs text-muted-foreground">
                          Balance: {fromToken ? fromToken.balance.toLocaleString() : '0'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="0.0"
                          value={fromAmount}
                          onChange={(e) => handleFromAmountChange(e.target.value)}
                          className="text-xl font-bold"
                        />
                        <Select 
                          value={fromToken?.symbol}
                          onValueChange={(value) => setFromToken(tokens.find(t => t.symbol === value) || null)}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Select token" />
                          </SelectTrigger>
                          <SelectContent>
                            {tokens.map((token) => (
                              <SelectItem key={token.symbol} value={token.symbol}>
                                <div className="flex items-center gap-2">
                                  <span>{token.symbol}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Swap Button */}
                    <div className="flex justify-center">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        onClick={switchTokens}
                      >
                        <ArrowUpDown className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* To Token */}
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Label>To</Label>
                        <span className="text-xs text-muted-foreground">
                          Balance: {toToken ? toToken.balance.toLocaleString() : '0'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="0.0"
                          value={toAmount}
                          readOnly
                          className="text-xl font-bold bg-muted"
                        />
                        <Select
                          value={toToken?.symbol}
                          onValueChange={(value) => setToToken(tokens.find(t => t.symbol === value) || null)}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Select token" />
                          </SelectTrigger>
                          <SelectContent>
                            {tokens.map((token) => (
                              <SelectItem key={token.symbol} value={token.symbol}>
                                <div className="flex items-center gap-2">
                                  <span>{token.symbol}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Price Info */}
                    {fromToken && toToken && fromAmount && (
                      <div className="p-3 bg-muted rounded-lg space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Rate</span>
                          <span>1 {fromToken.symbol} = {(fromToken.price / toToken.price).toFixed(4)} {toToken.symbol}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Price Impact</span>
                          <span className="text-green-500">{'<0.01%'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Minimum Received</span>
                          <span>{(parseFloat(toAmount) * (1 - slippage/100)).toFixed(4)} {toToken.symbol}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Network Fee</span>
                          <span>~$0.25</span>
                        </div>
                      </div>
                    )}

                    {/* Swap Button */}
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={handleSwap}
                      disabled={!fromToken || !toToken || !fromAmount || isSwapping}
                    >
                      {isSwapping ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Swapping...
                        </>
                      ) : (
                        'Swap Tokens'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Route Information */}
              {fromToken && toToken && (
                <Card className="mt-4">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Route</span>
                      <Badge variant="outline">
                        <Zap className="w-3 h-3 mr-1" />
                        Best Price
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{fromToken.symbol}</span>
                      <ArrowRight className="w-4 h-4" />
                      <span className="text-muted-foreground">MOLOCHAIN Pool V2</span>
                      <ArrowRight className="w-4 h-4" />
                      <span className="font-medium">{toToken.symbol}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Liquidity Tab */}
          <TabsContent value="liquidity" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add Liquidity</CardTitle>
                  <CardDescription>
                    Provide liquidity to earn fees and rewards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <Label className="mb-2">First Token</Label>
                      <div className="flex gap-2">
                        <Input type="number" placeholder="0.0" />
                        <Select>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {tokens.map((token) => (
                              <SelectItem key={token.symbol} value={token.symbol}>
                                {token.symbol}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <Plus className="w-4 h-4" />
                    </div>

                    <div className="p-4 border rounded-lg">
                      <Label className="mb-2">Second Token</Label>
                      <div className="flex gap-2">
                        <Input type="number" placeholder="0.0" />
                        <Select>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {tokens.map((token) => (
                              <SelectItem key={token.symbol} value={token.symbol}>
                                {token.symbol}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Alert>
                      <Info className="w-4 h-4" />
                      <AlertDescription>
                        You'll receive LP tokens representing your share of the pool. 
                        Earn 0.3% of all trades proportional to your share.
                      </AlertDescription>
                    </Alert>

                    <Button className="w-full" size="lg">
                      Add Liquidity
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Your Liquidity</CardTitle>
                  <CardDescription>
                    Manage your liquidity positions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {liquidityPools.filter(p => p.myLiquidity && p.myLiquidity > 0).map((pool) => (
                      <div key={pool.pair} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{pool.pair}</span>
                          <Badge className="bg-green-500/10 text-green-500">
                            {pool.apy}% APY
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex justify-between">
                            <span>Your Liquidity</span>
                            <span className="font-medium text-foreground">
                              ${pool.myLiquidity?.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Unclaimed Rewards</span>
                            <span className="font-medium text-green-500">
                              {pool.rewards} MOLOCHAIN
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" className="flex-1">
                            Remove
                          </Button>
                          <Button size="sm" className="flex-1">
                            Claim
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Pools Tab */}
          <TabsContent value="pools" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Liquidity Pools</CardTitle>
                    <CardDescription>
                      Explore available pools and their performance
                    </CardDescription>
                  </div>
                  <Select defaultValue="tvl">
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tvl">Sort by TVL</SelectItem>
                      <SelectItem value="apy">Sort by APY</SelectItem>
                      <SelectItem value="volume">Sort by Volume</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {liquidityPools.map((pool) => (
                    <div key={pool.pair} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-lg">{pool.pair}</h3>
                            <Badge className="bg-green-500/10 text-green-500">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              {pool.apy}% APY
                            </Badge>
                          </div>
                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              TVL: ${(pool.tvl / 1000000).toFixed(1)}M
                            </span>
                            <span className="flex items-center gap-1">
                              <Activity className="w-3 h-3" />
                              24h Volume: ${(pool.volume24h / 1000000).toFixed(1)}M
                            </span>
                            {pool.myLiquidity && pool.myLiquidity > 0 && (
                              <Badge variant="outline">
                                <Lock className="w-3 h-3 mr-1" />
                                Position: ${pool.myLiquidity.toLocaleString()}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button size="sm">
                          <Droplet className="w-4 h-4 mr-1" />
                          Add Liquidity
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>
                  Your recent swap and liquidity transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTransactions.map((tx, idx) => (
                    <div key={idx} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                            {tx.type === 'swap' ? (
                              <ArrowUpDown className="w-4 h-4" />
                            ) : (
                              <Droplet className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {tx.type === 'swap' ? 'Swapped' : 'Added Liquidity'}
                              </span>
                              <Badge className="bg-green-500/10 text-green-500">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {tx.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {tx.amountA} {tx.tokenA} → {tx.amountB} {tx.tokenB}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {tx.timestamp} • {tx.txHash}
                            </div>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TokenSwap;