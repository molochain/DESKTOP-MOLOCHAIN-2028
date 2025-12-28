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
  Coins,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Timer,
  Shield,
  Zap,
  PieChart,
  BarChart3,
  Activity,
  Users,
  Lock,
  Unlock,
  RefreshCw,
  Calculator,
  FileText,
  Receipt,
  CreditCard,
  Banknote,
  PiggyBank,
  HandCoins,
  Landmark,
  CircleDollarSign,
  Building2,
  Package,
  Truck,
  Container,
  Factory,
  Store,
  Warehouse,
  Ship,
  Plane,
  Globe,
  Target,
  Scale,
  Gauge,
  Heart,
  Star,
  Award,
  Crown,
  Diamond,
  Gem,
  Sparkles,
  Flame,
  Rocket,
  Gift,
  Trophy,
  Medal,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Copy,
  Settings,
  HelpCircle,
  Eye,
  EyeOff,
  Filter,
  Search,
  Plus,
  Minus,
  Hash,
  Percent,
  Clock,
  Calendar,
  Bell,
  BellOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const LendingProtocol = () => {
  const [selectedAsset, setSelectedAsset] = useState('USDC');
  const [actionType, setActionType] = useState<'supply' | 'borrow'>('supply');
  const [amount, setAmount] = useState('');
  const [collateralAsset, setCollateralAsset] = useState('ETH');
  const [borrowAsset, setBorrowAsset] = useState('USDC');
  const [ltv, setLtv] = useState([50]);
  const [useAsCollateral, setUseAsCollateral] = useState(true);

  // Lending Markets Data
  const lendingMarkets = [
    {
      symbol: 'USDC',
      name: 'USD Coin',
      icon: CircleDollarSign,
      category: 'Stablecoin',
      totalSupply: 185000000,
      totalBorrow: 142000000,
      supplyAPY: 5.8,
      borrowAPY: 7.2,
      utilization: 76.8,
      available: 43000000,
      collateralFactor: 85,
      liquidationThreshold: 88,
      liquidationPenalty: 5,
      maxLTV: 80,
      oracle: 'Chainlink',
      price: 1.00,
      supplyIncentive: 2.1,
      borrowIncentive: 3.5
    },
    {
      symbol: 'USDT',
      name: 'Tether',
      icon: DollarSign,
      category: 'Stablecoin',
      totalSupply: 225000000,
      totalBorrow: 195000000,
      supplyAPY: 6.2,
      borrowAPY: 7.8,
      utilization: 86.7,
      available: 30000000,
      collateralFactor: 85,
      liquidationThreshold: 88,
      liquidationPenalty: 5,
      maxLTV: 80,
      oracle: 'Chainlink',
      price: 1.00,
      supplyIncentive: 2.3,
      borrowIncentive: 3.8
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      icon: Coins,
      category: 'Crypto',
      totalSupply: 45000,
      totalBorrow: 28000,
      supplyAPY: 2.8,
      borrowAPY: 4.5,
      utilization: 62.2,
      available: 17000,
      collateralFactor: 75,
      liquidationThreshold: 80,
      liquidationPenalty: 10,
      maxLTV: 70,
      oracle: 'Chainlink',
      price: 2850.50,
      supplyIncentive: 1.5,
      borrowIncentive: 2.2
    },
    {
      symbol: 'wBTC',
      name: 'Wrapped Bitcoin',
      icon: Coins,
      category: 'Crypto',
      totalSupply: 2800,
      totalBorrow: 1900,
      supplyAPY: 1.8,
      borrowAPY: 3.2,
      utilization: 67.9,
      available: 900,
      collateralFactor: 70,
      liquidationThreshold: 75,
      liquidationPenalty: 10,
      maxLTV: 65,
      oracle: 'Chainlink',
      price: 45200.00,
      supplyIncentive: 1.2,
      borrowIncentive: 1.8
    },
    {
      symbol: 'CARGO',
      name: 'Cargo Token',
      icon: Container,
      category: 'Logistics',
      totalSupply: 12000000,
      totalBorrow: 8500000,
      supplyAPY: 8.5,
      borrowAPY: 11.2,
      utilization: 70.8,
      available: 3500000,
      collateralFactor: 60,
      liquidationThreshold: 65,
      liquidationPenalty: 15,
      maxLTV: 55,
      oracle: 'MoloOracle',
      price: 2.45,
      supplyIncentive: 4.2,
      borrowIncentive: 5.8
    },
    {
      symbol: 'SHIP',
      name: 'Shipping Token',
      icon: Ship,
      category: 'Logistics',
      totalSupply: 8500000,
      totalBorrow: 5200000,
      supplyAPY: 7.8,
      borrowAPY: 10.5,
      utilization: 61.2,
      available: 3300000,
      collateralFactor: 55,
      liquidationThreshold: 60,
      liquidationPenalty: 15,
      maxLTV: 50,
      oracle: 'MoloOracle',
      price: 1.85,
      supplyIncentive: 3.8,
      borrowIncentive: 5.2
    },
    {
      symbol: 'TRUCK',
      name: 'Trucking Token',
      icon: Truck,
      category: 'Logistics',
      totalSupply: 6500000,
      totalBorrow: 4100000,
      supplyAPY: 9.2,
      borrowAPY: 12.8,
      utilization: 63.1,
      available: 2400000,
      collateralFactor: 50,
      liquidationThreshold: 55,
      liquidationPenalty: 20,
      maxLTV: 45,
      oracle: 'MoloOracle',
      price: 0.75,
      supplyIncentive: 4.5,
      borrowIncentive: 6.2
    },
    {
      symbol: 'AIR',
      name: 'Air Cargo Token',
      icon: Plane,
      category: 'Logistics',
      totalSupply: 4200000,
      totalBorrow: 2800000,
      supplyAPY: 10.5,
      borrowAPY: 14.2,
      utilization: 66.7,
      available: 1400000,
      collateralFactor: 45,
      liquidationThreshold: 50,
      liquidationPenalty: 20,
      maxLTV: 40,
      oracle: 'MoloOracle',
      price: 3.25,
      supplyIncentive: 5.2,
      borrowIncentive: 7.1
    }
  ];

  // User Positions
  const userPositions = {
    supplied: [
      {
        asset: 'USDC',
        amount: 25000,
        apy: 5.8,
        earnings: 145.25,
        collateralEnabled: true
      },
      {
        asset: 'ETH',
        amount: 8.5,
        apy: 2.8,
        earnings: 0.238,
        collateralEnabled: true
      },
      {
        asset: 'CARGO',
        amount: 10000,
        apy: 8.5,
        earnings: 850,
        collateralEnabled: false
      }
    ],
    borrowed: [
      {
        asset: 'USDT',
        amount: 15000,
        apy: 7.8,
        interest: 1170,
        type: 'Variable'
      },
      {
        asset: 'SHIP',
        amount: 5000,
        apy: 10.5,
        interest: 525,
        type: 'Stable'
      }
    ]
  };

  // Risk Parameters
  const riskMetrics = {
    healthFactor: 2.15,
    borrowCapacity: 85000,
    borrowUsed: 45000,
    collateralValue: 68500,
    liquidationThreshold: 31850,
    netAPY: 1.8
  };

  // Protocol Stats
  const protocolStats = {
    totalValueLocked: 750000000,
    totalBorrowed: 485000000,
    totalSuppliers: 12850,
    totalBorrowers: 8420,
    averageUtilization: 64.7,
    protocolRevenue: 2850000
  };

  // Recent Transactions
  const recentTransactions = [
    {
      id: 'TX-001',
      type: 'Supply',
      asset: 'USDC',
      amount: 5000,
      user: '0x742d...8c9f',
      time: '2 min ago',
      txHash: '0xabc123...'
    },
    {
      id: 'TX-002',
      type: 'Borrow',
      asset: 'ETH',
      amount: 2.5,
      user: '0x9f2e...4d1a',
      time: '5 min ago',
      txHash: '0xdef456...'
    },
    {
      id: 'TX-003',
      type: 'Repay',
      asset: 'CARGO',
      amount: 1500,
      user: '0x3c1b...7e2f',
      time: '8 min ago',
      txHash: '0xghi789...'
    }
  ];

  const selectedMarketData = lendingMarkets.find(m => m.symbol === selectedAsset) || lendingMarkets[0];

  const calculateBorrowLimit = () => {
    const collateralValue = userPositions.supplied.reduce((total, position) => {
      if (position.collateralEnabled) {
        const market = lendingMarkets.find(m => m.symbol === position.asset);
        if (market) {
          return total + (position.amount * market.price * market.collateralFactor / 100);
        }
      }
      return total;
    }, 0);
    return collateralValue;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
    return `$${num.toFixed(2)}`;
  };

  const getHealthColor = (health: number) => {
    if (health >= 2) return 'text-green-500';
    if (health >= 1.5) return 'text-yellow-500';
    if (health >= 1.2) return 'text-orange-500';
    return 'text-red-500';
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-500';
    if (utilization >= 80) return 'text-orange-500';
    if (utilization >= 70) return 'text-yellow-500';
    return 'text-green-500';
  };

  const borrowLimit = calculateBorrowLimit();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Lending & Borrowing Protocol
            </h1>
            <p className="text-muted-foreground mt-2">
              Supply chain financing with competitive rates and flexible collateral
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Calculator className="h-4 w-4 mr-2" />
              Calculator
            </Button>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Docs
            </Button>
            <Button>
              <Wallet className="h-4 w-4 mr-2" />
              Connect Wallet
            </Button>
          </div>
        </div>

        {/* Protocol Stats */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Value Locked</p>
                  <p className="text-2xl font-bold">{formatNumber(protocolStats.totalValueLocked)}</p>
                </div>
                <Lock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Borrowed</p>
                  <p className="text-2xl font-bold">{formatNumber(protocolStats.totalBorrowed)}</p>
                </div>
                <HandCoins className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Utilization</p>
                  <p className="text-2xl font-bold">{protocolStats.averageUtilization.toFixed(1)}%</p>
                </div>
                <PieChart className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Suppliers</p>
                  <p className="text-2xl font-bold">{protocolStats.totalSuppliers.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-indigo-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Borrowers</p>
                  <p className="text-2xl font-bold">{protocolStats.totalBorrowers.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Protocol Revenue</p>
                  <p className="text-2xl font-bold">{formatNumber(protocolStats.protocolRevenue)}</p>
                </div>
                <Landmark className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Position Summary */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Your Position</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Health Factor */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Health Factor</span>
                <span className={cn("text-2xl font-bold", getHealthColor(riskMetrics.healthFactor))}>
                  {riskMetrics.healthFactor.toFixed(2)}
                </span>
              </div>
              <Progress 
                value={Math.min((riskMetrics.healthFactor / 3) * 100, 100)} 
                className={cn(
                  "h-2",
                  riskMetrics.healthFactor >= 2 && "[&>div]:bg-green-500",
                  riskMetrics.healthFactor >= 1.5 && riskMetrics.healthFactor < 2 && "[&>div]:bg-yellow-500",
                  riskMetrics.healthFactor >= 1.2 && riskMetrics.healthFactor < 1.5 && "[&>div]:bg-orange-500",
                  riskMetrics.healthFactor < 1.2 && "[&>div]:bg-red-500"
                )}
              />
              <p className="text-xs text-muted-foreground mt-2">
                {riskMetrics.healthFactor >= 2 ? 'Very Safe' :
                 riskMetrics.healthFactor >= 1.5 ? 'Safe' :
                 riskMetrics.healthFactor >= 1.2 ? 'At Risk' : 'Critical'}
              </p>
            </div>

            {/* Borrow Capacity */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Borrow Capacity</span>
                <span className="text-sm font-semibold">
                  {((riskMetrics.borrowUsed / riskMetrics.borrowCapacity) * 100).toFixed(1)}% Used
                </span>
              </div>
              <Progress 
                value={(riskMetrics.borrowUsed / riskMetrics.borrowCapacity) * 100} 
                className="h-2"
              />
              <div className="flex justify-between text-xs mt-1">
                <span>{formatNumber(riskMetrics.borrowUsed)}</span>
                <span className="text-muted-foreground">{formatNumber(riskMetrics.borrowCapacity)}</span>
              </div>
            </div>

            <Separator />

            {/* Position Summary */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Supplied</span>
                <span className="font-semibold">{formatNumber(riskMetrics.collateralValue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Borrowed</span>
                <span className="font-semibold">{formatNumber(riskMetrics.borrowUsed)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Net APY</span>
                <span className={cn(
                  "font-semibold",
                  riskMetrics.netAPY >= 0 ? 'text-green-500' : 'text-red-500'
                )}>
                  {riskMetrics.netAPY >= 0 ? '+' : ''}{riskMetrics.netAPY}%
                </span>
              </div>
            </div>

            <Separator />

            {/* Quick Actions */}
            <div className="space-y-2">
              <Button className="w-full" variant="outline">
                <Shield className="h-4 w-4 mr-2" />
                Manage Collateral
              </Button>
              <Button className="w-full" variant="outline">
                <Receipt className="h-4 w-4 mr-2" />
                Transaction History
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Markets Table */}
        <Card className="lg:col-span-2">
          <Tabs defaultValue="supply">
            <CardHeader>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="supply">Supply Markets</TabsTrigger>
                <TabsTrigger value="borrow">Borrow Markets</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="supply" className="space-y-2">
                {lendingMarkets.map((market) => {
                  const Icon = market.icon;
                  return (
                    <motion.div
                      key={market.symbol}
                      whileHover={{ scale: 1.01 }}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-all cursor-pointer"
                      onClick={() => {
                        setSelectedAsset(market.symbol);
                        setActionType('supply');
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">{market.symbol}</p>
                            <p className="text-sm text-muted-foreground">{market.name}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-8 text-right">
                          <div>
                            <p className="text-sm text-muted-foreground">Supply APY</p>
                            <p className="font-semibold text-green-500">
                              {market.supplyAPY}%
                              {market.supplyIncentive > 0 && (
                                <span className="text-xs text-purple-500 ml-1">
                                  +{market.supplyIncentive}%
                                </span>
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Total Supply</p>
                            <p className="font-semibold">{formatNumber(market.totalSupply * market.price)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Utilization</p>
                            <p className={cn("font-semibold", getUtilizationColor(market.utilization))}>
                              {market.utilization.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </TabsContent>

              <TabsContent value="borrow" className="space-y-2">
                {lendingMarkets.map((market) => {
                  const Icon = market.icon;
                  return (
                    <motion.div
                      key={market.symbol}
                      whileHover={{ scale: 1.01 }}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-all cursor-pointer"
                      onClick={() => {
                        setSelectedAsset(market.symbol);
                        setActionType('borrow');
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">{market.symbol}</p>
                            <p className="text-sm text-muted-foreground">{market.name}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-8 text-right">
                          <div>
                            <p className="text-sm text-muted-foreground">Borrow APY</p>
                            <p className="font-semibold text-orange-500">
                              {market.borrowAPY}%
                              {market.borrowIncentive > 0 && (
                                <span className="text-xs text-purple-500 ml-1">
                                  -{market.borrowIncentive}%
                                </span>
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Available</p>
                            <p className="font-semibold">{formatNumber(market.available * market.price)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Max LTV</p>
                            <p className="font-semibold">{market.maxLTV}%</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>

      {/* Action Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {actionType === 'supply' ? 'Supply' : 'Borrow'} {selectedMarketData.symbol}
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline">{selectedMarketData.category}</Badge>
              <Badge className="bg-green-500">
                {actionType === 'supply' ? `${selectedMarketData.supplyAPY}% APY` : `${selectedMarketData.borrowAPY}% APY`}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="space-y-4">
              <div>
                <Label>Amount</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="pr-20"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <Badge variant="secondary">{selectedMarketData.symbol}</Badge>
                    <Button size="sm" variant="ghost" className="h-6 px-2">
                      MAX
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Available: {formatNumber(selectedMarketData.available)}
                </p>
              </div>

              {actionType === 'supply' && (
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-sm">Use as Collateral</span>
                  </div>
                  <Switch
                    checked={useAsCollateral}
                    onCheckedChange={setUseAsCollateral}
                  />
                </div>
              )}

              {actionType === 'borrow' && (
                <>
                  <div>
                    <Label>Interest Rate Type</Label>
                    <Select defaultValue="variable">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="variable">Variable Rate</SelectItem>
                        <SelectItem value="stable">Stable Rate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Loan-to-Value (LTV)</Label>
                      <span className="text-sm font-semibold">{ltv[0]}%</span>
                    </div>
                    <Slider
                      value={ltv}
                      onValueChange={setLtv}
                      max={selectedMarketData.maxLTV}
                      min={10}
                      step={5}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Safe</span>
                      <span>Max {selectedMarketData.maxLTV}%</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Summary Section */}
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                <h4 className="font-semibold">Transaction Summary</h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {actionType === 'supply' ? 'Supply APY' : 'Borrow APY'}
                    </span>
                    <span className="font-semibold">
                      {actionType === 'supply' ? selectedMarketData.supplyAPY : selectedMarketData.borrowAPY}%
                    </span>
                  </div>
                  
                  {actionType === 'supply' && selectedMarketData.supplyIncentive > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Rewards APY</span>
                      <span className="font-semibold text-purple-500">
                        +{selectedMarketData.supplyIncentive}%
                      </span>
                    </div>
                  )}

                  {actionType === 'borrow' && selectedMarketData.borrowIncentive > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Rewards APY</span>
                      <span className="font-semibold text-purple-500">
                        -{selectedMarketData.borrowIncentive}%
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Collateral Factor</span>
                    <span className="font-semibold">{selectedMarketData.collateralFactor}%</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Liquidation Threshold</span>
                    <span className="font-semibold">{selectedMarketData.liquidationThreshold}%</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Oracle</span>
                    <span className="font-semibold">{selectedMarketData.oracle}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">Health Factor Change</span>
                    <span className="font-semibold text-green-500">
                      2.15 → 2.35
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Borrow Limit Change</span>
                    <span className="font-semibold">
                      {formatNumber(borrowLimit)} → {formatNumber(borrowLimit * 1.1)}
                    </span>
                  </div>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {actionType === 'supply' 
                    ? "Supplied assets earn interest automatically and can be used as collateral."
                    : "Variable rates change based on market conditions. Consider your risk tolerance."}
                </AlertDescription>
              </Alert>

              <Button className="w-full" size="lg">
                <Activity className="h-4 w-4 mr-2" />
                {actionType === 'supply' ? 'Supply' : 'Borrow'} {selectedMarketData.symbol}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Positions */}
      <Tabs defaultValue="supplied" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="supplied">Your Supplies</TabsTrigger>
          <TabsTrigger value="borrowed">Your Borrows</TabsTrigger>
          <TabsTrigger value="transactions">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="supplied">
          <Card>
            <CardHeader>
              <CardTitle>Supplied Assets</CardTitle>
              <CardDescription>Your lending positions earning interest</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userPositions.supplied.map((position, index) => {
                  const market = lendingMarkets.find(m => m.symbol === position.asset);
                  if (!market) return null;
                  const Icon = market.icon;
                  
                  return (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-semibold">{position.asset}</p>
                            <p className="text-sm text-muted-foreground">
                              {position.collateralEnabled ? 'Collateral Enabled' : 'Collateral Disabled'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatNumber(position.amount * market.price)}</p>
                          <p className="text-sm text-green-500">+{formatNumber(position.earnings)}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Amount</p>
                          <p className="font-semibold">{position.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">APY</p>
                          <p className="font-semibold text-green-500">{position.apy}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Earnings</p>
                          <p className="font-semibold">{position.earnings.toFixed(3)}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Plus className="h-4 w-4 mr-1" />
                          Supply More
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Minus className="h-4 w-4 mr-1" />
                          Withdraw
                        </Button>
                        <Button size="sm" variant="outline">
                          <Shield className="h-4 w-4 mr-1" />
                          Collateral
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="borrowed">
          <Card>
            <CardHeader>
              <CardTitle>Borrowed Assets</CardTitle>
              <CardDescription>Your active loans and interest payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userPositions.borrowed.map((position, index) => {
                  const market = lendingMarkets.find(m => m.symbol === position.asset);
                  if (!market) return null;
                  const Icon = market.icon;
                  
                  return (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-semibold">{position.asset}</p>
                            <p className="text-sm text-muted-foreground">
                              {position.type} Rate
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatNumber(position.amount * market.price)}</p>
                          <p className="text-sm text-orange-500">-{formatNumber(position.interest)}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Amount</p>
                          <p className="font-semibold">{position.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">APY</p>
                          <p className="font-semibold text-orange-500">{position.apy}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Interest</p>
                          <p className="font-semibold">${position.interest.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Plus className="h-4 w-4 mr-1" />
                          Borrow More
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <CreditCard className="h-4 w-4 mr-1" />
                          Repay
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest protocol interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        tx.type === 'Supply' && "bg-green-500/10",
                        tx.type === 'Borrow' && "bg-orange-500/10",
                        tx.type === 'Repay' && "bg-blue-500/10"
                      )}>
                        {tx.type === 'Supply' && <ArrowUpRight className="h-4 w-4 text-green-500" />}
                        {tx.type === 'Borrow' && <ArrowDownRight className="h-4 w-4 text-orange-500" />}
                        {tx.type === 'Repay' && <CreditCard className="h-4 w-4 text-blue-500" />}
                      </div>
                      <div>
                        <p className="font-semibold">{tx.type} {tx.asset}</p>
                        <p className="text-sm text-muted-foreground">{tx.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{tx.amount.toLocaleString()} {tx.asset}</p>
                      <Button variant="ghost" size="sm" className="h-6 text-xs">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
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
  );
};

export default LendingProtocol;