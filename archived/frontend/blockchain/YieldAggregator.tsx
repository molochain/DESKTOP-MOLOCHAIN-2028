import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  TrendingUp,
  DollarSign,
  Shield,
  Zap,
  Target,
  Info,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Settings,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  ExternalLink,
  Wallet,
  Coins,
  BarChart3,
  PieChart,
  Lock,
  Unlock,
  Sparkles,
  Award,
  Trophy,
  Star,
  Flame,
  Calculator,
  Download,
  Search,
  Gauge,
  Activity,
  Package,
  Layers,
  GitBranch,
  Shuffle,
  TrendingDown,
  Timer,
  Brain
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const YieldAggregator = () => {
  const [selectedStrategy, setSelectedStrategy] = useState('balanced');
  const [investmentAmount, setInvestmentAmount] = useState('10000');
  const [riskTolerance, setRiskTolerance] = useState([50]);
  const [autoCompound, setAutoCompound] = useState(true);
  const [autoRebalance, setAutoRebalance] = useState(true);

  // Available Protocols
  const protocols = [
    {
      name: 'MoloDEX',
      tvl: 587400000,
      pools: 12,
      avgAPY: 85.4,
      risk: 'low',
      chains: ['Ethereum', 'Polygon'],
      logo: '🔷'
    },
    {
      name: 'UniswapV3',
      tvl: 4500000000,
      pools: 450,
      avgAPY: 32.5,
      risk: 'low',
      chains: ['Ethereum', 'Arbitrum', 'Optimism'],
      logo: '🦄'
    },
    {
      name: 'PancakeSwap',
      tvl: 2800000000,
      pools: 320,
      avgAPY: 45.8,
      risk: 'medium',
      chains: ['BSC'],
      logo: '🥞'
    },
    {
      name: 'Curve',
      tvl: 5200000000,
      pools: 180,
      avgAPY: 18.5,
      risk: 'very-low',
      chains: ['Ethereum', 'Polygon'],
      logo: '🌊'
    },
    {
      name: 'Aave',
      tvl: 8900000000,
      pools: 25,
      avgAPY: 12.3,
      risk: 'very-low',
      chains: ['Ethereum', 'Polygon', 'Avalanche'],
      logo: '👻'
    },
    {
      name: 'Compound',
      tvl: 3200000000,
      pools: 15,
      avgAPY: 8.7,
      risk: 'very-low',
      chains: ['Ethereum'],
      logo: '🏦'
    }
  ];

  // Yield Opportunities
  const yieldOpportunities = [
    {
      id: 'OPP001',
      protocol: 'MoloDEX',
      pair: 'MOLOCHAIN/USDT',
      currentAPY: 125.8,
      projectedAPY: 132.5,
      tvl: 125847500,
      risk: 'medium',
      impermanentLoss: -3.2,
      gasOptimized: true,
      autoCompound: true,
      lockPeriod: 0,
      minDeposit: 100,
      chain: 'Polygon',
      strategy: 'Concentrated Liquidity',
      confidence: 92
    },
    {
      id: 'OPP002',
      protocol: 'Curve',
      pair: 'USDT/USDC/DAI',
      currentAPY: 22.5,
      projectedAPY: 24.8,
      tvl: 985000000,
      risk: 'very-low',
      impermanentLoss: 0.01,
      gasOptimized: true,
      autoCompound: false,
      lockPeriod: 0,
      minDeposit: 50,
      chain: 'Ethereum',
      strategy: 'Stable Pool',
      confidence: 98
    },
    {
      id: 'OPP003',
      protocol: 'PancakeSwap',
      pair: 'BNB/BUSD',
      currentAPY: 68.4,
      projectedAPY: 72.1,
      tvl: 456000000,
      risk: 'medium',
      impermanentLoss: -4.5,
      gasOptimized: true,
      autoCompound: true,
      lockPeriod: 7,
      minDeposit: 200,
      chain: 'BSC',
      strategy: 'Liquidity Mining',
      confidence: 85
    },
    {
      id: 'OPP004',
      protocol: 'UniswapV3',
      pair: 'ETH/USDT',
      currentAPY: 45.2,
      projectedAPY: 48.7,
      tvl: 2850000000,
      risk: 'medium',
      impermanentLoss: -5.8,
      gasOptimized: false,
      autoCompound: false,
      lockPeriod: 0,
      minDeposit: 500,
      chain: 'Ethereum',
      strategy: 'Range Order',
      confidence: 78
    },
    {
      id: 'OPP005',
      protocol: 'Aave',
      pair: 'USDC Lending',
      currentAPY: 15.8,
      projectedAPY: 16.2,
      tvl: 3450000000,
      risk: 'very-low',
      impermanentLoss: 0,
      gasOptimized: true,
      autoCompound: false,
      lockPeriod: 0,
      minDeposit: 10,
      chain: 'Polygon',
      strategy: 'Lending',
      confidence: 95
    }
  ];

  // Strategies
  const strategies = [
    {
      name: 'Conservative',
      description: 'Focus on stable pools with minimal IL risk',
      targetAPY: 15,
      riskLevel: 'very-low',
      allocation: {
        stablePools: 70,
        lending: 20,
        lowRiskFarms: 10
      }
    },
    {
      name: 'Balanced',
      description: 'Mix of stable and volatile pools for optimal returns',
      targetAPY: 45,
      riskLevel: 'medium',
      allocation: {
        stablePools: 30,
        lending: 10,
        lowRiskFarms: 30,
        highYieldFarms: 30
      }
    },
    {
      name: 'Aggressive',
      description: 'High-yield opportunities with active management',
      targetAPY: 85,
      riskLevel: 'high',
      allocation: {
        stablePools: 10,
        lending: 5,
        lowRiskFarms: 25,
        highYieldFarms: 60
      }
    },
    {
      name: 'DeFi Degen',
      description: 'Maximum yield with highest risk tolerance',
      targetAPY: 150,
      riskLevel: 'very-high',
      allocation: {
        stablePools: 0,
        lending: 0,
        lowRiskFarms: 15,
        highYieldFarms: 85
      }
    }
  ];

  // Portfolio Allocation
  const currentAllocation = [
    { protocol: 'MoloDEX', amount: 45000, percentage: 45, apy: 125.8 },
    { protocol: 'Curve', amount: 25000, percentage: 25, apy: 22.5 },
    { protocol: 'Aave', amount: 15000, percentage: 15, apy: 15.8 },
    { protocol: 'PancakeSwap', amount: 10000, percentage: 10, apy: 68.4 },
    { protocol: 'UniswapV3', amount: 5000, percentage: 5, apy: 45.2 }
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000000000) return `$${(num / 1000000000).toFixed(2)}B`;
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'very-low': return 'text-green-500';
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-orange-500';
      case 'very-high': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'very-low': return 'bg-green-500';
      case 'low': return 'bg-green-400';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'very-high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const calculateProjectedReturns = () => {
    const amount = parseFloat(investmentAmount) || 0;
    const avgAPY = currentAllocation.reduce((acc, item) => 
      acc + (item.apy * item.percentage / 100), 0
    );
    
    return {
      daily: amount * (avgAPY / 365 / 100),
      weekly: amount * (avgAPY / 52 / 100),
      monthly: amount * (avgAPY / 12 / 100),
      yearly: amount * (avgAPY / 100)
    };
  };

  const projectedReturns = calculateProjectedReturns();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Yield Aggregator
            </h1>
            <p className="text-muted-foreground mt-2">
              Automatically find and invest in the best yield opportunities across DeFi
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Calculator className="h-4 w-4 mr-2" />
              APY Calculator
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
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold">$100K</p>
                </div>
                <Wallet className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg APY</p>
                  <p className="text-2xl font-bold">67.8%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Daily Yield</p>
                  <p className="text-2xl font-bold">$185.75</p>
                </div>
                <Coins className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Farms</p>
                  <p className="text-2xl font-bold">5</p>
                </div>
                <Layers className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Gas Saved</p>
                  <p className="text-2xl font-bold">$1,247</p>
                </div>
                <Zap className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="opportunities" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="opportunities">Best Opportunities</TabsTrigger>
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
          <TabsTrigger value="portfolio">My Portfolio</TabsTrigger>
          <TabsTrigger value="protocols">Protocols</TabsTrigger>
          <TabsTrigger value="optimizer">Optimizer</TabsTrigger>
        </TabsList>

        {/* Best Opportunities Tab */}
        <TabsContent value="opportunities" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Top Yield Opportunities</CardTitle>
                  <CardDescription>AI-selected best farming opportunities based on risk/reward</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Search pools..." className="w-[200px]" />
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Chains</SelectItem>
                      <SelectItem value="ethereum">Ethereum</SelectItem>
                      <SelectItem value="polygon">Polygon</SelectItem>
                      <SelectItem value="bsc">BSC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {yieldOpportunities.map((opp) => (
                  <motion.div
                    key={opp.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{protocols.find(p => p.name === opp.protocol)?.logo}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{opp.pair}</h3>
                            <Badge variant="outline">{opp.protocol}</Badge>
                            <Badge variant="secondary">{opp.chain}</Badge>
                            <Badge className={getRiskBadgeColor(opp.risk)}>
                              {opp.risk.charAt(0).toUpperCase() + opp.risk.slice(1)} Risk
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Strategy: {opp.strategy} • Min Deposit: ${opp.minDeposit}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-500">
                          {opp.currentAPY}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Current APY
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">TVL</p>
                        <p className="font-semibold">{formatNumber(opp.tvl)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Projected APY</p>
                        <p className="font-semibold text-green-500">
                          {opp.projectedAPY}%
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">IL Risk</p>
                        <p className={cn(
                          "font-semibold",
                          opp.impermanentLoss < -5 ? 'text-red-500' : 
                          opp.impermanentLoss < -2 ? 'text-yellow-500' : 'text-green-500'
                        )}>
                          {opp.impermanentLoss}%
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Confidence</p>
                        <div className="flex items-center gap-2">
                          <Progress value={opp.confidence} className="h-2 w-16" />
                          <span>{opp.confidence}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Lock</p>
                        <p className="font-semibold">
                          {opp.lockPeriod === 0 ? 'No Lock' : `${opp.lockPeriod} days`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      {opp.gasOptimized && (
                        <Badge variant="outline" className="text-xs">
                          <Zap className="h-3 w-3 mr-1" />
                          Gas Optimized
                        </Badge>
                      )}
                      {opp.autoCompound && (
                        <Badge variant="outline" className="text-xs">
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Auto-Compound
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      <Button size="sm" className="flex-1">
                        <DollarSign className="h-4 w-4 mr-1" />
                        Invest Now
                      </Button>
                      <Button size="sm" variant="outline">
                        <Info className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                      <Button size="sm" variant="outline">
                        <Calculator className="h-4 w-4 mr-1" />
                        Simulate
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Strategies Tab */}
        <TabsContent value="strategies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Yield Strategies</CardTitle>
              <CardDescription>Choose or customize your yield farming strategy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {strategies.map((strategy) => (
                  <Card 
                    key={strategy.name}
                    className={cn(
                      "cursor-pointer transition-all",
                      selectedStrategy === strategy.name.toLowerCase() && "ring-2 ring-primary"
                    )}
                    onClick={() => setSelectedStrategy(strategy.name.toLowerCase())}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{strategy.name}</CardTitle>
                        <Badge className={getRiskBadgeColor(strategy.riskLevel)}>
                          {strategy.riskLevel.replace('-', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <CardDescription>{strategy.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Target APY</span>
                          <span className="text-lg font-bold text-green-500">
                            {strategy.targetAPY}%+
                          </span>
                        </div>
                        <Separator />
                        <div className="space-y-2">
                          <p className="text-sm font-semibold">Allocation:</p>
                          {Object.entries(strategy.allocation).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                              <div className="flex items-center gap-2">
                                <Progress value={value} className="h-2 w-20" />
                                <span className="w-10 text-right">{value}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Custom Strategy Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Risk Tolerance</Label>
                    <div className="flex items-center gap-4">
                      <Slider 
                        value={riskTolerance} 
                        onValueChange={setRiskTolerance}
                        max={100}
                        step={1}
                        className="flex-1"
                      />
                      <span className="w-12 text-right font-semibold">{riskTolerance}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="auto-compound">Auto-Compound Rewards</Label>
                      <p className="text-xs text-muted-foreground">
                        Automatically reinvest earned rewards
                      </p>
                    </div>
                    <Switch
                      id="auto-compound"
                      checked={autoCompound}
                      onCheckedChange={setAutoCompound}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="auto-rebalance">Auto-Rebalance Portfolio</Label>
                      <p className="text-xs text-muted-foreground">
                        Maintain optimal allocation automatically
                      </p>
                    </div>
                    <Switch
                      id="auto-rebalance"
                      checked={autoRebalance}
                      onCheckedChange={setAutoRebalance}
                    />
                  </div>

                  <Button className="w-full">
                    <Brain className="h-4 w-4 mr-2" />
                    Apply Strategy
                  </Button>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Current Portfolio Allocation</CardTitle>
                <Button variant="outline" size="sm">
                  <Shuffle className="h-4 w-4 mr-1" />
                  Rebalance
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentAllocation.map((item) => (
                  <div key={item.protocol} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {protocols.find(p => p.name === item.protocol)?.logo}
                        </span>
                        <span className="font-semibold">{item.protocol}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatNumber(item.amount)}</p>
                        <p className="text-sm text-green-500">{item.apy}% APY</p>
                      </div>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <h3 className="font-semibold">Projected Returns</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Daily</p>
                    <p className="text-lg font-bold text-green-500">
                      ${projectedReturns.daily.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Weekly</p>
                    <p className="text-lg font-bold text-green-500">
                      ${projectedReturns.weekly.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly</p>
                    <p className="text-lg font-bold text-green-500">
                      ${projectedReturns.monthly.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Yearly</p>
                    <p className="text-lg font-bold text-green-500">
                      ${projectedReturns.yearly.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Protocols Tab */}
        <TabsContent value="protocols" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integrated Protocols</CardTitle>
              <CardDescription>All protocols available for yield aggregation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {protocols.map((protocol) => (
                  <Card key={protocol.name}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{protocol.logo}</span>
                          <CardTitle className="text-lg">{protocol.name}</CardTitle>
                        </div>
                        <Badge className={getRiskBadgeColor(protocol.risk)}>
                          {protocol.risk}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">TVL</p>
                          <p className="font-semibold">{formatNumber(protocol.tvl)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Avg APY</p>
                          <p className="font-semibold text-green-500">{protocol.avgAPY}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Pools</p>
                          <p className="font-semibold">{protocol.pools}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Chains</p>
                          <p className="font-semibold">{protocol.chains.length}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {protocol.chains.map((chain) => (
                          <Badge key={chain} variant="outline" className="text-xs">
                            {chain}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Optimizer Tab */}
        <TabsContent value="optimizer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Yield Optimizer</CardTitle>
              <CardDescription>
                AI-powered optimization to maximize your yields
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Investment Amount (USD)</Label>
                <Input
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>

              <Alert>
                <Brain className="h-4 w-4" />
                <AlertDescription>
                  The AI optimizer analyzes 500+ pools across 6 protocols to find the best 
                  yield opportunities matching your risk profile. It considers gas costs, 
                  impermanent loss, and historical performance.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>Optimization Factors</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Gas optimization</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm">IL minimization</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Auto-compounding</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Risk assessment</span>
                  </div>
                </div>
              </div>

              <Button className="w-full" size="lg">
                <Brain className="h-4 w-4 mr-2" />
                Optimize My Yield
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default YieldAggregator;