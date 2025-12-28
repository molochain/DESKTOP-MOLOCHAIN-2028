import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Droplets,
  TrendingUp,
  Wallet,
  ArrowDownUp,
  Shield,
  Zap,
  DollarSign,
  Coins,
  BarChart3,
  Info,
  AlertCircle,
  CheckCircle,
  Lock,
  ExternalLink,
  Plus,
  Minus,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  Repeat,
  Clock,
  Award,
  Target,
  Sparkles,
  GitBranch,
  Globe
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LiquidityPool {
  id: string;
  name: string;
  token1: string;
  token2: string;
  tvl: number;
  apy: number;
  volume24h: number;
  fees24h: number;
  myLiquidity?: number;
  utilization: number;
  risk: 'low' | 'medium' | 'high';
  rewards: string[];
}

interface Farm {
  id: string;
  name: string;
  pair: string;
  staked: number;
  apy: number;
  bonus: number;
  lockPeriod: number;
  rewards: string[];
  totalStaked: number;
  endDate: Date;
  multiplier: number;
}

interface Bridge {
  id: string;
  name: string;
  from: string;
  to: string;
  fee: number;
  time: string;
  volume24h: number;
  supported: boolean;
}

const DeFiIntegration = () => {
  const { toast } = useToast();
  const [selectedPool, setSelectedPool] = useState<string | null>(null);
  const [liquidityAmount, setLiquidityAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('MOLOCHAIN');
  const [slippage, setSlippage] = useState('0.5');

  const liquidityPools: LiquidityPool[] = [
    {
      id: 'LP001',
      name: 'MOLOCHAIN/USDT',
      token1: 'MOLOCHAIN',
      token2: 'USDT',
      tvl: 12847392,
      apy: 42.8,
      volume24h: 2384729,
      fees24h: 7154,
      myLiquidity: 5000,
      utilization: 78,
      risk: 'low',
      rewards: ['MOLOCHAIN', 'Trading Fees']
    },
    {
      id: 'LP002',
      name: 'MOLOCHAIN/ETH',
      token1: 'MOLOCHAIN',
      token2: 'ETH',
      tvl: 8392847,
      apy: 38.5,
      volume24h: 1892374,
      fees24h: 5677,
      utilization: 65,
      risk: 'medium',
      rewards: ['MOLOCHAIN', 'Trading Fees']
    },
    {
      id: 'LP003',
      name: 'MOLOCHAIN/BNB',
      token1: 'MOLOCHAIN',
      token2: 'BNB',
      tvl: 5928374,
      apy: 35.2,
      volume24h: 982374,
      fees24h: 2947,
      utilization: 54,
      risk: 'medium',
      rewards: ['MOLOCHAIN', 'BNB', 'Trading Fees']
    },
    {
      id: 'LP004',
      name: 'MOLOCHAIN/MATIC',
      token1: 'MOLOCHAIN',
      token2: 'MATIC',
      tvl: 3847293,
      apy: 52.4,
      volume24h: 738492,
      fees24h: 2215,
      utilization: 82,
      risk: 'high',
      rewards: ['MOLOCHAIN', 'MATIC', 'Bonus Rewards']
    }
  ];

  const yieldFarms: Farm[] = [
    {
      id: 'YF001',
      name: 'Genesis Farm',
      pair: 'MOLOCHAIN/USDT LP',
      staked: 238947,
      apy: 124.5,
      bonus: 2.5,
      lockPeriod: 30,
      rewards: ['MOLOCHAIN', 'xMOLOCHAIN'],
      totalStaked: 4892374,
      endDate: new Date('2025-03-01'),
      multiplier: 3
    },
    {
      id: 'YF002',
      name: 'Turbo Farm',
      pair: 'MOLOCHAIN/ETH LP',
      staked: 0,
      apy: 98.2,
      bonus: 1.8,
      lockPeriod: 14,
      rewards: ['MOLOCHAIN'],
      totalStaked: 2893847,
      endDate: new Date('2025-02-15'),
      multiplier: 2
    },
    {
      id: 'YF003',
      name: 'Stable Farm',
      pair: 'USDT/USDC LP',
      staked: 50000,
      apy: 18.5,
      bonus: 0.5,
      lockPeriod: 0,
      rewards: ['MOLOCHAIN'],
      totalStaked: 8493827,
      endDate: new Date('2025-06-01'),
      multiplier: 1
    }
  ];

  const bridges: Bridge[] = [
    {
      id: 'BR001',
      name: 'Ethereum Bridge',
      from: 'BSC',
      to: 'Ethereum',
      fee: 0.3,
      time: '10-15 min',
      volume24h: 3847293,
      supported: true
    },
    {
      id: 'BR002',
      name: 'Polygon Bridge',
      from: 'BSC',
      to: 'Polygon',
      fee: 0.1,
      time: '5-10 min',
      volume24h: 2938472,
      supported: true
    },
    {
      id: 'BR003',
      name: 'Avalanche Bridge',
      from: 'BSC',
      to: 'Avalanche',
      fee: 0.2,
      time: '8-12 min',
      volume24h: 1829374,
      supported: true
    },
    {
      id: 'BR004',
      name: 'Arbitrum Bridge',
      from: 'Ethereum',
      to: 'Arbitrum',
      fee: 0.15,
      time: '5-8 min',
      volume24h: 4928374,
      supported: false
    }
  ];

  const getRiskColor = (risk: string) => {
    switch(risk) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const handleAddLiquidity = () => {
    if (!liquidityAmount || !selectedPool) {
      toast({
        title: "Missing Information",
        description: "Please enter amount and select a pool",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Liquidity Added",
      description: `Successfully added ${liquidityAmount} ${selectedToken} to the pool`,
    });
    setLiquidityAmount('');
  };

  const handleStakeFarm = (farmId: string) => {
    toast({
      title: "Staking Initiated",
      description: "Your LP tokens have been staked in the farm",
    });
  };

  const handleBridge = (bridgeId: string) => {
    toast({
      title: "Bridge Transfer Started",
      description: "Your tokens are being bridged. This may take a few minutes.",
    });
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
              <Sparkles className="w-3 h-3 mr-1" /> DeFi Hub
            </Badge>
            <h1 className="text-4xl font-bold mb-4">DeFi Integration</h1>
            <p className="text-muted-foreground text-lg">
              Access decentralized finance features including liquidity pools, yield farming, 
              cross-chain bridges, and automated market making.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Value Locked</p>
                  <p className="text-2xl font-bold">$30.9M</p>
                  <p className="text-xs text-green-500">+12.4% (24h)</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Lock className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">24h Volume</p>
                  <p className="text-2xl font-bold">$5.9M</p>
                  <p className="text-xs text-green-500">+28.3%</p>
                </div>
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Pools</p>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-xs text-muted-foreground">4 new this week</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <Droplets className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg APY</p>
                  <p className="text-2xl font-bold">42.2%</p>
                  <p className="text-xs text-yellow-500">Variable rate</p>
                </div>
                <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="pools" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pools">Liquidity Pools</TabsTrigger>
            <TabsTrigger value="farming">Yield Farming</TabsTrigger>
            <TabsTrigger value="swap">Swap</TabsTrigger>
            <TabsTrigger value="bridge">Bridge</TabsTrigger>
          </TabsList>

          {/* Liquidity Pools */}
          <TabsContent value="pools" className="mt-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Available Pools</CardTitle>
                    <CardDescription>
                      Provide liquidity and earn trading fees plus rewards
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {liquidityPools.map((pool) => (
                        <motion.div
                          key={pool.id}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          whileHover={{ scale: 1.01 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${
                              selectedPool === pool.id ? 'ring-2 ring-primary' : ''
                            }`}
                            onClick={() => setSelectedPool(pool.id)}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold">{pool.name}</h4>
                                  <Badge variant="secondary" className={getRiskColor(pool.risk)}>
                                    {pool.risk} risk
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span>TVL: ${(pool.tvl / 1000000).toFixed(1)}M</span>
                                  <span>24h Vol: ${(pool.volume24h / 1000000).toFixed(1)}M</span>
                                  <span>24h Fees: ${pool.fees24h.toLocaleString()}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-green-500">
                                  {pool.apy}%
                                </div>
                                <div className="text-xs text-muted-foreground">APY</div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Pool Utilization</span>
                                <span>{pool.utilization}%</span>
                              </div>
                              <Progress value={pool.utilization} className="h-2" />
                            </div>

                            {pool.myLiquidity && pool.myLiquidity > 0 && (
                              <div className="mt-3 pt-3 border-t flex justify-between">
                                <span className="text-sm text-muted-foreground">My Liquidity</span>
                                <span className="font-medium">${pool.myLiquidity.toLocaleString()}</span>
                              </div>
                            )}

                            <div className="mt-3 flex gap-2">
                              {pool.rewards.map((reward, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {reward}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Add Liquidity Panel */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      Add Liquidity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-muted-foreground">Select Token</label>
                        <Select value={selectedToken} onValueChange={setSelectedToken}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MOLOCHAIN">MOLOCHAIN</SelectItem>
                            <SelectItem value="USDT">USDT</SelectItem>
                            <SelectItem value="ETH">ETH</SelectItem>
                            <SelectItem value="BNB">BNB</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm text-muted-foreground">Amount</label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={liquidityAmount}
                          onChange={(e) => setLiquidityAmount(e.target.value)}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <label className="text-sm text-muted-foreground">Slippage Tolerance</label>
                        <div className="flex gap-2 mt-1">
                          {['0.1', '0.5', '1.0'].map((value) => (
                            <Button
                              key={value}
                              size="sm"
                              variant={slippage === value ? 'default' : 'outline'}
                              onClick={() => setSlippage(value)}
                            >
                              {value}%
                            </Button>
                          ))}
                          <Input
                            type="number"
                            placeholder="Custom"
                            className="w-20"
                            value={slippage}
                            onChange={(e) => setSlippage(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="p-3 bg-muted rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Share of Pool</span>
                          <span>0.042%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Est. APY</span>
                          <span className="text-green-500">42.8%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Est. Daily Rewards</span>
                          <span>~12.5 MOLOCHAIN</span>
                        </div>
                      </div>

                      <Button 
                        className="w-full" 
                        size="lg"
                        onClick={handleAddLiquidity}
                      >
                        Add Liquidity
                      </Button>

                      <div className="p-3 bg-yellow-500/10 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-muted-foreground">
                            Adding liquidity exposes you to impermanent loss. 
                            Make sure you understand the risks before proceeding.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Yield Farming */}
          <TabsContent value="farming" className="mt-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Active Farms</CardTitle>
                  <CardDescription>
                    Stake LP tokens to earn additional rewards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {yieldFarms.map((farm) => (
                      <motion.div
                        key={farm.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card className="overflow-hidden">
                          <div className="p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Award className="w-5 h-5 text-yellow-500" />
                                <h3 className="font-semibold">{farm.name}</h3>
                              </div>
                              <Badge variant="secondary">
                                {farm.multiplier}x
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{farm.pair}</p>
                          </div>
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">APY</span>
                                <div className="text-right">
                                  <div className="font-bold text-green-500">
                                    {farm.apy}%
                                  </div>
                                  {farm.bonus > 0 && (
                                    <div className="text-xs text-muted-foreground">
                                      +{farm.bonus}% bonus
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Lock Period</span>
                                <span className="text-sm">
                                  {farm.lockPeriod === 0 ? 'Flexible' : `${farm.lockPeriod} days`}
                                </span>
                              </div>

                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Total Staked</span>
                                <span className="text-sm">
                                  ${(farm.totalStaked / 1000000).toFixed(1)}M
                                </span>
                              </div>

                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Ends In</span>
                                <span className="text-sm">
                                  {Math.ceil((farm.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                                </span>
                              </div>

                              {farm.staked > 0 ? (
                                <div className="pt-3 border-t">
                                  <div className="flex justify-between mb-2">
                                    <span className="text-sm text-muted-foreground">My Stake</span>
                                    <span className="font-medium">${farm.staked.toLocaleString()}</span>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button size="sm" className="flex-1">
                                      Harvest
                                    </Button>
                                    <Button size="sm" variant="outline" className="flex-1">
                                      Unstake
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <Button 
                                  className="w-full" 
                                  size="sm"
                                  onClick={() => handleStakeFarm(farm.id)}
                                >
                                  Stake LP Tokens
                                </Button>
                              )}

                              <div className="flex gap-1">
                                {farm.rewards.map((reward, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {reward}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Swap */}
          <TabsContent value="swap" className="mt-6">
            <div className="max-w-xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowDownUp className="w-5 h-5" />
                    Token Swap
                  </CardTitle>
                  <CardDescription>
                    Instantly swap tokens at the best available rates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex justify-between mb-2">
                        <label className="text-sm text-muted-foreground">From</label>
                        <span className="text-xs text-muted-foreground">Balance: 10,000</span>
                      </div>
                      <div className="flex gap-2">
                        <Input type="number" placeholder="0.00" className="flex-1" />
                        <Select defaultValue="MOLOCHAIN">
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MOLOCHAIN">MOLOCHAIN</SelectItem>
                            <SelectItem value="USDT">USDT</SelectItem>
                            <SelectItem value="ETH">ETH</SelectItem>
                            <SelectItem value="BNB">BNB</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <Button size="icon" variant="outline" className="rounded-full">
                        <ArrowDownUp className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex justify-between mb-2">
                        <label className="text-sm text-muted-foreground">To</label>
                        <span className="text-xs text-muted-foreground">Balance: 5,000</span>
                      </div>
                      <div className="flex gap-2">
                        <Input type="number" placeholder="0.00" className="flex-1" />
                        <Select defaultValue="USDT">
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MOLOCHAIN">MOLOCHAIN</SelectItem>
                            <SelectItem value="USDT">USDT</SelectItem>
                            <SelectItem value="ETH">ETH</SelectItem>
                            <SelectItem value="BNB">BNB</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="p-3 bg-muted rounded-lg space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Exchange Rate</span>
                        <span>1 MOLOCHAIN = 0.45 USDT</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Price Impact</span>
                        <span className="text-green-500">0.03%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Network Fee</span>
                        <span>~$0.25</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Route</span>
                        <span className="flex items-center gap-1">
                          MOLOCHAIN <ArrowRight className="w-3 h-3" /> USDT
                        </span>
                      </div>
                    </div>

                    <Button className="w-full" size="lg">
                      Swap Tokens
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Bridge */}
          <TabsContent value="bridge" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Cross-Chain Bridge</CardTitle>
                <CardDescription>
                  Transfer MOLOCHAIN tokens between different blockchain networks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {bridges.map((bridge) => (
                    <motion.div
                      key={bridge.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                    >
                      <Card className={!bridge.supported ? 'opacity-60' : ''}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                                <GitBranch className="w-5 h-5 text-blue-500" />
                              </div>
                              <div>
                                <h4 className="font-semibold">{bridge.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {bridge.from} → {bridge.to}
                                </p>
                              </div>
                            </div>
                            {bridge.supported ? (
                              <Badge variant="outline" className="text-green-500">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-yellow-500">
                                <Clock className="w-3 h-3 mr-1" />
                                Coming Soon
                              </Badge>
                            )}
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Bridge Fee</span>
                              <span>{bridge.fee}%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Est. Time</span>
                              <span>{bridge.time}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">24h Volume</span>
                              <span>${(bridge.volume24h / 1000000).toFixed(1)}M</span>
                            </div>
                          </div>

                          <Button 
                            className="w-full" 
                            disabled={!bridge.supported}
                            onClick={() => handleBridge(bridge.id)}
                          >
                            {bridge.supported ? 'Bridge Tokens' : 'Coming Soon'}
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-500/10 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm mb-1">Bridge Security</p>
                      <p className="text-xs text-muted-foreground">
                        All bridge transfers are secured by multi-signature wallets and undergo 
                        verification by multiple validators. Large transfers may require additional 
                        confirmation time for security purposes.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DeFiIntegration;