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
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Wallet,
  Activity,
  Shield,
  Zap,
  Award,
  Target,
  Sparkles,
  Lock,
  Unlock,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Info,
  RefreshCw,
  Settings,
  Filter,
  Search,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Minus,
  Repeat,
  GitBranch,
  Droplets,
  Coins,
  BarChart3,
  ChevronRight,
  ExternalLink,
  Layers,
  Flame,
  Gem,
  Crown,
  Calculator,
  Bot,
  Gauge,
  Package,
  Percent,
  Star,
  Trophy,
  Users,
  Briefcase
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const DeFiEnhanced = () => {
  const [selectedFarm, setSelectedFarm] = useState<string | null>(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [selectedStrategy, setSelectedStrategy] = useState('balanced');
  const [autoCompound, setAutoCompound] = useState(true);
  const [riskTolerance, setRiskTolerance] = useState([50]);
  const [isLoading, setIsLoading] = useState(false);

  // Enhanced Yield Farms
  const yieldFarms = [
    {
      id: 'FARM001',
      name: 'MOLOCHAIN-USDT LP Farm',
      pair: 'MOLOCHAIN/USDT',
      icon: '🌾',
      tvl: 45890000,
      apy: 128.5,
      boostedApy: 185.2,
      dailyRewards: 12500,
      rewardToken: 'MOLOCHAIN',
      myStake: 25000,
      earned: 3250.75,
      lockPeriod: 0,
      multiplier: 3.5,
      risk: 'low',
      autoCompounding: true,
      harvestFee: 0.5,
      depositFee: 0,
      withdrawFee: 0.1,
      endTime: new Date('2025-12-31'),
      status: 'active',
      features: ['Auto-Compound', 'Boost Available', 'No Lock']
    },
    {
      id: 'FARM002',
      name: 'MOLOCHAIN-ETH Turbo Farm',
      pair: 'MOLOCHAIN/ETH',
      icon: '🚀',
      tvl: 38500000,
      apy: 165.8,
      boostedApy: 235.4,
      dailyRewards: 18500,
      rewardToken: 'MOLOCHAIN',
      myStake: 15000,
      earned: 2150.25,
      lockPeriod: 7,
      multiplier: 5.0,
      risk: 'medium',
      autoCompounding: true,
      harvestFee: 0.3,
      depositFee: 0,
      withdrawFee: 0.5,
      endTime: new Date('2025-10-31'),
      status: 'active',
      features: ['Turbo Rewards', '5x Multiplier', 'NFT Boost']
    },
    {
      id: 'FARM003',
      name: 'Stable Trinity Pool',
      pair: 'USDT/USDC/DAI',
      icon: '💎',
      tvl: 125000000,
      apy: 42.3,
      boostedApy: 58.9,
      dailyRewards: 5200,
      rewardToken: 'MOLOCHAIN',
      myStake: 50000,
      earned: 1825.50,
      lockPeriod: 0,
      multiplier: 1.5,
      risk: 'low',
      autoCompounding: false,
      harvestFee: 0,
      depositFee: 0,
      withdrawFee: 0,
      endTime: new Date('2026-01-31'),
      status: 'active',
      features: ['Stable Returns', 'Zero Fees', 'Insurance Fund']
    },
    {
      id: 'FARM004',
      name: 'DeFi Index Farm',
      pair: 'DeFi Index',
      icon: '📊',
      tvl: 28750000,
      apy: 95.6,
      boostedApy: 142.8,
      dailyRewards: 8900,
      rewardToken: 'MOLOCHAIN',
      myStake: 0,
      earned: 0,
      lockPeriod: 30,
      multiplier: 8.0,
      risk: 'high',
      autoCompounding: true,
      harvestFee: 1.0,
      depositFee: 0.5,
      withdrawFee: 2.0,
      endTime: new Date('2025-09-30'),
      status: 'active',
      features: ['8x Multiplier', 'Index Exposure', 'Governance Power']
    },
    {
      id: 'FARM005',
      name: 'Cross-Chain Yield Aggregator',
      pair: 'Multi-Chain',
      icon: '🌐',
      tvl: 67250000,
      apy: 156.2,
      boostedApy: 245.8,
      dailyRewards: 22000,
      rewardToken: 'MOLOCHAIN',
      myStake: 8500,
      earned: 1285.75,
      lockPeriod: 14,
      multiplier: 6.5,
      risk: 'medium',
      autoCompounding: true,
      harvestFee: 0.75,
      depositFee: 0.25,
      withdrawFee: 1.5,
      endTime: new Date('2025-11-30'),
      status: 'active',
      features: ['Cross-Chain', 'Auto-Rebalance', 'MEV Protection']
    }
  ];

  // Yield Strategies
  const yieldStrategies = [
    {
      id: 'conservative',
      name: 'Conservative',
      description: 'Focus on stable pairs with lower risk',
      targetApy: '40-60%',
      risk: 'low',
      allocation: {
        stablePools: 70,
        majorPairs: 25,
        experimental: 5
      },
      icon: Shield,
      color: 'text-green-500'
    },
    {
      id: 'balanced',
      name: 'Balanced',
      description: 'Mix of stable and volatile pairs',
      targetApy: '80-120%',
      risk: 'medium',
      allocation: {
        stablePools: 40,
        majorPairs: 45,
        experimental: 15
      },
      icon: Target,
      color: 'text-blue-500'
    },
    {
      id: 'aggressive',
      name: 'Aggressive',
      description: 'High-yield volatile pairs',
      targetApy: '150-250%',
      risk: 'high',
      allocation: {
        stablePools: 10,
        majorPairs: 30,
        experimental: 60
      },
      icon: Flame,
      color: 'text-red-500'
    },
    {
      id: 'degen',
      name: 'Degen Mode',
      description: 'Maximum yield, maximum risk',
      targetApy: '300%+',
      risk: 'extreme',
      allocation: {
        stablePools: 0,
        majorPairs: 10,
        experimental: 90
      },
      icon: Crown,
      color: 'text-purple-500'
    }
  ];

  // Vault Performance
  const vaultPerformance = [
    { period: '24h', return: 2.34, value: 102340 },
    { period: '7d', return: 18.56, value: 118560 },
    { period: '30d', return: 45.23, value: 145230 },
    { period: '90d', return: 156.78, value: 256780 },
    { period: '1y', return: 892.45, value: 992450 }
  ];

  // Auto-Compound Settings
  const compoundSettings = {
    enabled: true,
    frequency: 'daily',
    minThreshold: 10,
    gasOptimization: true,
    reinvestRatio: 100,
    claimRewards: true
  };

  // Boosters & Multipliers
  const boosters = [
    {
      name: 'MOLOCHAIN Staking',
      requirement: '10,000 MOLOCHAIN',
      boost: '1.5x',
      active: true,
      icon: '🔷'
    },
    {
      name: 'NFT Collection',
      requirement: 'Genesis NFT',
      boost: '1.25x',
      active: true,
      icon: '🖼️'
    },
    {
      name: 'Loyalty Program',
      requirement: '30 days staking',
      boost: '1.2x',
      active: false,
      icon: '⭐'
    },
    {
      name: 'Referral Bonus',
      requirement: '5 referrals',
      boost: '1.1x',
      active: false,
      icon: '👥'
    }
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-orange-500';
      case 'extreme': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const handleStake = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const calculateProjectedEarnings = (apy: number, amount: number, days: number) => {
    const dailyRate = apy / 365 / 100;
    return amount * Math.pow(1 + dailyRate, days) - amount;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              DeFi Yield Optimizer
            </h1>
            <p className="text-muted-foreground mt-2">
              Maximize your yields with advanced farming strategies and auto-compounding vaults
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Value Locked</p>
                  <p className="text-2xl font-bold">$342.5M</p>
                </div>
                <Droplets className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">My Total Stake</p>
                  <p className="text-2xl font-bold">$123.5K</p>
                </div>
                <Lock className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Earned</p>
                  <p className="text-2xl font-bold text-green-500">$18.9K</p>
                </div>
                <Coins className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg APY</p>
                  <p className="text-2xl font-bold">145.8%</p>
                </div>
                <Percent className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Positions</p>
                  <p className="text-2xl font-bold">8</p>
                </div>
                <Layers className="h-8 w-8 text-indigo-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="farms" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="farms">Yield Farms</TabsTrigger>
          <TabsTrigger value="vaults">Auto Vaults</TabsTrigger>
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
          <TabsTrigger value="optimizer">Optimizer</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Yield Farms Tab */}
        <TabsContent value="farms" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Yield Farms</CardTitle>
                  <CardDescription>Stake LP tokens to earn rewards</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Search farms..." className="w-[200px]" />
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Farms</SelectItem>
                      <SelectItem value="staked">My Farms</SelectItem>
                      <SelectItem value="stable">Stable Pairs</SelectItem>
                      <SelectItem value="volatile">Volatile Pairs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {yieldFarms.map((farm) => (
                  <motion.div
                    key={farm.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">{farm.icon}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{farm.name}</h3>
                            {farm.features.map((feature, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span>{farm.pair}</span>
                            <span>•</span>
                            <span className={getRiskColor(farm.risk)}>
                              {farm.risk.charAt(0).toUpperCase() + farm.risk.slice(1)} Risk
                            </span>
                            <span>•</span>
                            <span>{farm.multiplier}x Multiplier</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-500">
                          {farm.boostedApy}% APY
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Base: {farm.apy}%
                        </div>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="grid grid-cols-5 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">TVL</p>
                        <p className="font-semibold">{formatNumber(farm.tvl)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Daily Rewards</p>
                        <p className="font-semibold">{farm.dailyRewards.toLocaleString()} {farm.rewardToken}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">My Stake</p>
                        <p className="font-semibold">{formatNumber(farm.myStake)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Earned</p>
                        <p className="font-semibold text-green-500">
                          {farm.earned.toLocaleString()} {farm.rewardToken}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Lock Period</p>
                        <p className="font-semibold">
                          {farm.lockPeriod === 0 ? 'No Lock' : `${farm.lockPeriod} days`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      {farm.myStake > 0 ? (
                        <>
                          <Button variant="outline" size="sm">
                            <Minus className="h-4 w-4 mr-1" />
                            Unstake
                          </Button>
                          <Button variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-1" />
                            Stake More
                          </Button>
                          <Button size="sm" className="bg-green-500 hover:bg-green-600">
                            <Coins className="h-4 w-4 mr-1" />
                            Harvest ({farm.earned.toFixed(2)})
                          </Button>
                          {farm.autoCompounding && (
                            <Badge variant="secondary" className="ml-auto">
                              <Bot className="h-3 w-3 mr-1" />
                              Auto-Compounding
                            </Badge>
                          )}
                        </>
                      ) : (
                        <>
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-1" />
                            Stake
                          </Button>
                          <Button variant="outline" size="sm">
                            <Info className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Auto Vaults Tab */}
        <TabsContent value="vaults" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Auto-Compounding Vaults</CardTitle>
              <CardDescription>
                Automated yield optimization with compound interest
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Vault Settings */}
              <div className="border rounded-lg p-4 bg-muted/50">
                <h3 className="font-semibold mb-4">Global Vault Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-compound">Auto-Compound</Label>
                    <Switch id="auto-compound" checked={autoCompound} onCheckedChange={setAutoCompound} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="gas-opt">Gas Optimization</Label>
                    <Switch id="gas-opt" defaultChecked />
                  </div>
                  <div className="space-y-2">
                    <Label>Compound Frequency</Label>
                    <Select defaultValue="daily">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Reinvest Ratio</Label>
                    <div className="flex items-center gap-2">
                      <Slider defaultValue={[100]} max={100} step={5} className="flex-1" />
                      <span className="text-sm font-medium w-12">100%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vault Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Vault Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-4">
                    {vaultPerformance.map((perf) => (
                      <div key={perf.period} className="text-center">
                        <p className="text-sm text-muted-foreground">{perf.period}</p>
                        <p className={cn(
                          "text-lg font-bold",
                          perf.return > 0 ? 'text-green-500' : 'text-red-500'
                        )}>
                          +{perf.return}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatNumber(perf.value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Active Boosters */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Active Boosters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {boosters.map((booster) => (
                      <div key={booster.name} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{booster.icon}</span>
                          <div>
                            <p className="font-medium">{booster.name}</p>
                            <p className="text-xs text-muted-foreground">{booster.requirement}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={booster.active ? 'default' : 'outline'}>
                            {booster.boost}
                          </Badge>
                          {booster.active && (
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 ml-auto" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Strategies Tab */}
        <TabsContent value="strategies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Yield Strategies</CardTitle>
              <CardDescription>
                Choose your risk profile and let our algorithms optimize your yields
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {yieldStrategies.map((strategy) => (
                <motion.div
                  key={strategy.id}
                  whileHover={{ scale: 1.02 }}
                  className={cn(
                    "border rounded-lg p-4 cursor-pointer transition-all",
                    selectedStrategy === strategy.id && "border-primary ring-2 ring-primary/20"
                  )}
                  onClick={() => setSelectedStrategy(strategy.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <strategy.icon className={cn("h-8 w-8", strategy.color)} />
                      <div>
                        <h3 className="font-semibold">{strategy.name}</h3>
                        <p className="text-sm text-muted-foreground">{strategy.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{strategy.targetApy}</div>
                      <Badge variant="outline" className={getRiskColor(strategy.risk)}>
                        {strategy.risk.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Stable Pools</span>
                      <span>{strategy.allocation.stablePools}%</span>
                    </div>
                    <Progress value={strategy.allocation.stablePools} className="h-2" />
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Major Pairs</span>
                      <span>{strategy.allocation.majorPairs}%</span>
                    </div>
                    <Progress value={strategy.allocation.majorPairs} className="h-2" />
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Experimental</span>
                      <span>{strategy.allocation.experimental}%</span>
                    </div>
                    <Progress value={strategy.allocation.experimental} className="h-2" />
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Optimizer Tab */}
        <TabsContent value="optimizer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Yield Optimizer</CardTitle>
              <CardDescription>
                AI-powered yield optimization across all protocols
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Investment Amount</Label>
                  <Input
                    type="number"
                    placeholder="Enter amount in USD"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Investment Period</Label>
                  <Select defaultValue="90">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">180 days</SelectItem>
                      <SelectItem value="365">365 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Risk Tolerance</Label>
                <div className="flex items-center gap-4">
                  <span className="text-sm">Conservative</span>
                  <Slider
                    value={riskTolerance}
                    onValueChange={setRiskTolerance}
                    max={100}
                    step={10}
                    className="flex-1"
                  />
                  <span className="text-sm">Aggressive</span>
                  <span className="text-sm font-medium w-12">{riskTolerance[0]}%</span>
                </div>
              </div>

              {stakeAmount && (
                <Alert>
                  <Calculator className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2 mt-2">
                      <div className="flex justify-between">
                        <span>Projected 30-day earnings:</span>
                        <span className="font-semibold text-green-500">
                          {formatNumber(calculateProjectedEarnings(145.8, parseFloat(stakeAmount), 30))}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Projected 90-day earnings:</span>
                        <span className="font-semibold text-green-500">
                          {formatNumber(calculateProjectedEarnings(145.8, parseFloat(stakeAmount), 90))}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Projected 365-day earnings:</span>
                        <span className="font-semibold text-green-500">
                          {formatNumber(calculateProjectedEarnings(145.8, parseFloat(stakeAmount), 365))}
                        </span>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <Button className="w-full" size="lg" onClick={handleStake} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Bot className="h-4 w-4 mr-2" />
                    Start Auto-Optimization
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Liquidity Pools', 'Yield Farms', 'Staking', 'Lending'].map((category, index) => {
                    const values = [45, 30, 15, 10];
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{category}</span>
                          <span>{values[index]}%</span>
                        </div>
                        <Progress value={values[index]} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Portfolio Risk Score</span>
                    <Badge className="text-yellow-500">Medium (65/100)</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Impermanent Loss Risk</span>
                      <span className="text-yellow-500">Moderate</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Smart Contract Risk</span>
                      <span className="text-green-500">Low</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Liquidity Risk</span>
                      <span className="text-green-500">Low</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Platform Risk</span>
                      <span className="text-green-500">Low</span>
                    </div>
                  </div>
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      Your portfolio is well-diversified with acceptable risk levels. 
                      Consider adding more stable pairs to reduce volatility.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Historical Performance</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                [Performance Chart Placeholder]
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeFiEnhanced;