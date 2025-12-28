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
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Droplets,
  TrendingUp,
  DollarSign,
  Activity,
  Shield,
  Zap,
  Award,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Info,
  RefreshCw,
  Settings,
  Filter,
  Plus,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  ExternalLink,
  Wallet,
  Coins,
  BarChart3,
  PieChart,
  Gauge,
  Users,
  Lock,
  Unlock,
  Target,
  Sparkles,
  Gift,
  Gem,
  Trophy,
  Star,
  Flame,
  Calculator,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const LiquidityMining = () => {
  const [selectedPool, setSelectedPool] = useState<string | null>(null);
  const [liquidityAmount, setLiquidityAmount] = useState('');
  const [slippageTolerance, setSlippageTolerance] = useState('0.5');
  const [isProcessing, setIsProcessing] = useState(false);

  // Liquidity Pools Data
  const liquidityPools = [
    {
      id: 'POOL001',
      name: 'MOLOCHAIN/USDT',
      platform: 'MoloDEX',
      tvl: 125847500,
      volume24h: 28450000,
      apr: 85.4,
      rewards: ['MOLOCHAIN', 'USDT'],
      myLiquidity: 25000,
      myShare: 0.02,
      earned: 4250.75,
      multiplier: 3.5,
      status: 'active',
      risk: 'low',
      impermanentLoss: -2.3,
      utilization: 78,
      participants: 3456,
      lockPeriod: 0,
      features: ['Auto-Compound', 'No Lock', 'Bonus Rewards'],
      token0: {
        symbol: 'MOLOCHAIN',
        amount: 2500000,
        price: 5.00,
        logo: '🔷'
      },
      token1: {
        symbol: 'USDT',
        amount: 12500000,
        price: 1.00,
        logo: '💵'
      }
    },
    {
      id: 'POOL002',
      name: 'MOLOCHAIN/ETH',
      platform: 'MoloDEX',
      tvl: 98500000,
      volume24h: 18750000,
      apr: 125.8,
      rewards: ['MOLOCHAIN', 'ETH'],
      myLiquidity: 15000,
      myShare: 0.015,
      earned: 3125.50,
      multiplier: 5.0,
      status: 'active',
      risk: 'medium',
      impermanentLoss: -5.7,
      utilization: 65,
      participants: 2134,
      lockPeriod: 7,
      features: ['5x Rewards', 'NFT Boost', 'VIP Access'],
      token0: {
        symbol: 'MOLOCHAIN',
        amount: 1970000,
        price: 5.00,
        logo: '🔷'
      },
      token1: {
        symbol: 'ETH',
        amount: 2736,
        price: 3600,
        logo: '⟠'
      }
    },
    {
      id: 'POOL003',
      name: 'MOLOCHAIN/BNB',
      platform: 'MoloDEX',
      tvl: 45650000,
      volume24h: 8925000,
      apr: 95.2,
      rewards: ['MOLOCHAIN', 'BNB'],
      myLiquidity: 0,
      myShare: 0,
      earned: 0,
      multiplier: 4.0,
      status: 'active',
      risk: 'medium',
      impermanentLoss: -3.8,
      utilization: 52,
      participants: 1567,
      lockPeriod: 14,
      features: ['4x Rewards', 'Referral Bonus'],
      token0: {
        symbol: 'MOLOCHAIN',
        amount: 913000,
        price: 5.00,
        logo: '🔷'
      },
      token1: {
        symbol: 'BNB',
        amount: 130428,
        price: 350,
        logo: '🔶'
      }
    },
    {
      id: 'POOL004',
      name: 'USDT/USDC',
      platform: 'StableSwap',
      tvl: 285000000,
      volume24h: 125000000,
      apr: 18.5,
      rewards: ['MOLOCHAIN'],
      myLiquidity: 50000,
      myShare: 0.018,
      earned: 925.30,
      multiplier: 1.0,
      status: 'active',
      risk: 'low',
      impermanentLoss: 0.01,
      utilization: 92,
      participants: 8765,
      lockPeriod: 0,
      features: ['Stable Pair', 'Low Risk', 'Insurance'],
      token0: {
        symbol: 'USDT',
        amount: 142500000,
        price: 1.00,
        logo: '💵'
      },
      token1: {
        symbol: 'USDC',
        amount: 142500000,
        price: 1.00,
        logo: '💲'
      }
    },
    {
      id: 'POOL005',
      name: 'MOLOCHAIN/MATIC',
      platform: 'MoloDEX',
      tvl: 32450000,
      volume24h: 5890000,
      apr: 78.9,
      rewards: ['MOLOCHAIN', 'MATIC'],
      myLiquidity: 8500,
      myShare: 0.026,
      earned: 1680.25,
      multiplier: 3.0,
      status: 'active',
      risk: 'medium',
      impermanentLoss: -4.2,
      utilization: 45,
      participants: 987,
      lockPeriod: 30,
      features: ['Long-term Bonus', 'Loyalty Rewards'],
      token0: {
        symbol: 'MOLOCHAIN',
        amount: 649000,
        price: 5.00,
        logo: '🔷'
      },
      token1: {
        symbol: 'MATIC',
        amount: 3245000,
        price: 1.00,
        logo: '🟣'
      }
    }
  ];

  // Mining Rewards
  const miningRewards = [
    { token: 'MOLOCHAIN', amount: 12847.65, value: 64238.25, icon: '🔷' },
    { token: 'ETH', amount: 2.85, value: 10260.00, icon: '⟠' },
    { token: 'BNB', amount: 45.2, value: 15820.00, icon: '🔶' },
    { token: 'USDT', amount: 8925.50, value: 8925.50, icon: '💵' }
  ];

  // Pool Analytics
  const poolAnalytics = [
    { metric: 'Total TVL', value: '$587.4M', change: '+12.5%' },
    { metric: 'Total Volume 24h', value: '$186.7M', change: '+23.4%' },
    { metric: 'Average APR', value: '81.2%', change: '+5.8%' },
    { metric: 'Total Participants', value: '17.8K', change: '+8.2%' }
  ];

  // Reward Multipliers
  const rewardMultipliers = [
    { type: 'Base Mining', multiplier: '1x', active: true },
    { type: 'MOLOCHAIN Staking', multiplier: '1.5x', active: true },
    { type: 'NFT Holder', multiplier: '1.25x', active: true },
    { type: 'Early Liquidity', multiplier: '1.2x', active: false },
    { type: 'Referral Program', multiplier: '1.1x', active: false }
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000000000) return `$${(num / 1000000000).toFixed(2)}B`;
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getILColor = (il: number) => {
    if (il > -1) return 'text-green-500';
    if (il > -5) return 'text-yellow-500';
    return 'text-red-500';
  };

  const handleAddLiquidity = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
    }, 2000);
  };

  const calculateRewards = (apr: number, amount: number, days: number) => {
    const dailyRate = apr / 365 / 100;
    return amount * dailyRate * days;
  };

  const getTotalMultiplier = () => {
    return rewardMultipliers.reduce((acc, m) => {
      if (m.active) {
        const value = parseFloat(m.multiplier.replace('x', ''));
        return acc * value;
      }
      return acc;
    }, 1);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Liquidity Mining Center
            </h1>
            <p className="text-muted-foreground mt-2">
              Provide liquidity to earn trading fees and mining rewards
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Calculator className="h-4 w-4 mr-2" />
              Calculator
            </Button>
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

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {poolAnalytics.map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.metric}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className={cn(
                      "text-sm flex items-center gap-1 mt-1",
                      stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'
                    )}>
                      {stat.change.startsWith('+') ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {stat.change}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="pools" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pools">Liquidity Pools</TabsTrigger>
          <TabsTrigger value="positions">My Positions</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Liquidity Pools Tab */}
        <TabsContent value="pools" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Available Liquidity Pools</CardTitle>
                  <CardDescription>Add liquidity to earn fees and rewards</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Search pools..." className="w-[200px]" />
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Pools</SelectItem>
                      <SelectItem value="active">Active Only</SelectItem>
                      <SelectItem value="stable">Stable Pairs</SelectItem>
                      <SelectItem value="volatile">Volatile Pairs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {liquidityPools.map((pool) => (
                  <motion.div
                    key={pool.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex -space-x-2">
                          <span className="text-2xl">{pool.token0.logo}</span>
                          <span className="text-2xl">{pool.token1.logo}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{pool.name}</h3>
                            <Badge variant="outline">{pool.platform}</Badge>
                            {pool.features.map((feature, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className={getRiskColor(pool.risk)}>
                              {pool.risk.charAt(0).toUpperCase() + pool.risk.slice(1)} Risk
                            </span>
                            <span>•</span>
                            <span>{pool.multiplier}x Rewards</span>
                            <span>•</span>
                            <span>{pool.participants.toLocaleString()} Participants</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-500">
                          {pool.apr}% APR
                        </div>
                        <div className="text-sm text-muted-foreground">
                          +Trading Fees
                        </div>
                      </div>
                    </div>

                    <Separator className="mb-4" />

                    <div className="grid grid-cols-6 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">TVL</p>
                        <p className="font-semibold">{formatNumber(pool.tvl)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Volume 24h</p>
                        <p className="font-semibold">{formatNumber(pool.volume24h)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">IL</p>
                        <p className={cn("font-semibold", getILColor(pool.impermanentLoss))}>
                          {pool.impermanentLoss}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Utilization</p>
                        <div className="flex items-center gap-2">
                          <Progress value={pool.utilization} className="h-2 w-16" />
                          <span className="text-sm">{pool.utilization}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">My Share</p>
                        <p className="font-semibold">
                          {pool.myShare > 0 ? `${pool.myShare}%` : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Lock</p>
                        <p className="font-semibold">
                          {pool.lockPeriod === 0 ? 'No Lock' : `${pool.lockPeriod} days`}
                        </p>
                      </div>
                    </div>

                    {pool.myLiquidity > 0 && (
                      <>
                        <Separator className="my-4" />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">My Liquidity</p>
                              <p className="font-semibold">{formatNumber(pool.myLiquidity)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Earned</p>
                              <p className="font-semibold text-green-500">
                                {formatNumber(pool.earned)}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Minus className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                            <Button variant="outline" size="sm">
                              <Plus className="h-4 w-4 mr-1" />
                              Add More
                            </Button>
                            <Button size="sm" className="bg-green-500 hover:bg-green-600">
                              <Coins className="h-4 w-4 mr-1" />
                              Harvest
                            </Button>
                          </div>
                        </div>
                      </>
                    )}

                    {pool.myLiquidity === 0 && (
                      <div className="flex items-center gap-2 mt-4">
                        <Button 
                          size="sm" 
                          onClick={() => setSelectedPool(pool.id)}
                          className="flex-1"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Liquidity
                        </Button>
                        <Button variant="outline" size="sm">
                          <Info className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Positions Tab */}
        <TabsContent value="positions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Liquidity Positions</CardTitle>
              <CardDescription>Manage your active liquidity positions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {liquidityPools.filter(p => p.myLiquidity > 0).map((pool) => (
                  <div key={pool.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                          <span className="text-2xl">{pool.token0.logo}</span>
                          <span className="text-2xl">{pool.token1.logo}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">{pool.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Position opened 30 days ago
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-green-500">
                        Active
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Position Value</p>
                        <p className="font-semibold text-lg">{formatNumber(pool.myLiquidity)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Pool Share</p>
                        <p className="font-semibold text-lg">{pool.myShare}%</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Total Earned</p>
                        <p className="font-semibold text-lg text-green-500">
                          {formatNumber(pool.earned)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Current APR</p>
                        <p className="font-semibold text-lg">{pool.apr}%</p>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{pool.token0.symbol}</span>
                          <span>{(pool.myLiquidity * 0.5 / pool.token0.price).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{pool.token1.symbol}</span>
                          <span>{(pool.myLiquidity * 0.5 / pool.token1.price).toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Fees Earned</span>
                          <span>$1,250.45</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Rewards Earned</span>
                          <span>$3,000.30</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Minus className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                      <Button size="sm" className="flex-1 bg-green-500 hover:bg-green-600">
                        <Coins className="h-4 w-4 mr-1" />
                        Claim Rewards
                      </Button>
                    </div>
                  </div>
                ))}

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Your positions are earning an average of {formatNumber(246.85)} per day. 
                    Consider adding more liquidity to stable pairs for consistent returns.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Claimable Rewards</CardTitle>
                <CardDescription>Your pending mining rewards</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {miningRewards.map((reward) => (
                  <div key={reward.token} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{reward.icon}</span>
                      <div>
                        <p className="font-semibold">{reward.token}</p>
                        <p className="text-sm text-muted-foreground">
                          {reward.amount.toLocaleString()} tokens
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatNumber(reward.value)}</p>
                      <Button size="sm" variant="outline">
                        Claim
                      </Button>
                    </div>
                  </div>
                ))}
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Total Value</span>
                  <span className="text-xl font-bold text-green-500">
                    {formatNumber(miningRewards.reduce((acc, r) => acc + r.value, 0))}
                  </span>
                </div>
                <Button className="w-full" size="lg">
                  <Gift className="h-4 w-4 mr-2" />
                  Claim All Rewards
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reward Multipliers</CardTitle>
                <CardDescription>Active bonuses and boosts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {rewardMultipliers.map((multiplier) => (
                  <div key={multiplier.type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {multiplier.active ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Lock className="h-4 w-4 text-gray-400" />
                      )}
                      <span className={cn(
                        "text-sm",
                        !multiplier.active && "text-muted-foreground"
                      )}>
                        {multiplier.type}
                      </span>
                    </div>
                    <Badge variant={multiplier.active ? "default" : "outline"}>
                      {multiplier.multiplier}
                    </Badge>
                  </div>
                ))}
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Total Multiplier</span>
                  <span className="text-xl font-bold text-green-500">
                    {getTotalMultiplier().toFixed(2)}x
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Rewards History</CardTitle>
              <CardDescription>Your past 30 days earnings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                [Rewards Chart Placeholder - Shows daily earnings over time]
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Invested</span>
                  <span className="font-semibold">$98,500</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Current Value</span>
                  <span className="font-semibold">$112,847</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Earned</span>
                  <span className="font-semibold text-green-500">$14,347</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">ROI</span>
                  <span className="font-bold text-green-500">+14.56%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Risk Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">IL Exposure</span>
                  <span className="font-semibold text-yellow-500">-3.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Risk Score</span>
                  <Badge className="text-yellow-500">Medium</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Diversification</span>
                  <span className="font-semibold">4 Pools</span>
                </div>
                <Progress value={65} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Consider adding stable pairs to reduce risk
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Projected Earnings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Daily</span>
                  <span className="font-semibold">$246.85</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Weekly</span>
                  <span className="font-semibold">$1,727.95</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Monthly</span>
                  <span className="font-semibold">$7,405.50</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Yearly</span>
                  <span className="font-semibold text-green-500">$90,100.25</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Pool Comparison</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {liquidityPools.slice(0, 3).map((pool) => (
                  <div key={pool.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{pool.name}</span>
                      <span className="text-sm text-green-500">{pool.apr}% APR</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">TVL: </span>
                        <span>{formatNumber(pool.tvl)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Volume: </span>
                        <span>{formatNumber(pool.volume24h)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">IL: </span>
                        <span className={getILColor(pool.impermanentLoss)}>
                          {pool.impermanentLoss}%
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Users: </span>
                        <span>{pool.participants.toLocaleString()}</span>
                      </div>
                    </div>
                    <Progress value={pool.utilization} className="h-1" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LiquidityMining;