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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Users,
  Activity,
  AlertCircle,
  Info,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Truck,
  Ship,
  Plane,
  Package,
  MapPin,
  Calendar,
  Timer,
  Gauge,
  Target,
  Award,
  Trophy,
  BarChart3,
  LineChart,
  PieChart,
  Hash,
  ThumbsUp,
  ThumbsDown,
  Eye,
  MessageSquare,
  Star,
  Zap,
  Flame,
  Crown,
  Shield,
  Lock,
  Unlock,
  GitBranch,
  Percent,
  Calculator,
  Banknote,
  CreditCard,
  Wallet,
  ExternalLink,
  Share2,
  Bookmark,
  Filter,
  Search,
  RefreshCw,
  Settings,
  HelpCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Coins,
  Scale,
  Sparkles,
  Database,
  Fuel,
  Globe,
  Navigation,
  Anchor,
  Container,
  Warehouse
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const PredictionMarket = () => {
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState('100');
  const [selectedOutcome, setSelectedOutcome] = useState('yes');
  const [slippage, setSlippage] = useState([2]);

  // Active Markets
  const markets = [
    {
      id: 'MKT-001',
      category: 'Shipping',
      title: 'Will Suez Canal remain open for the rest of 2025?',
      description: 'Resolution based on official canal authority announcements',
      icon: Ship,
      status: 'active',
      volume: 2458000,
      liquidity: 850000,
      endDate: '2025-12-31',
      participants: 12456,
      yesPrice: 0.85,
      noPrice: 0.15,
      createdBy: '0x742d...35C9',
      resolutionSource: 'Suez Canal Authority',
      tags: ['Shipping', 'Trade Routes', 'Global'],
      trending: true,
      featured: true
    },
    {
      id: 'MKT-002',
      category: 'Fuel Prices',
      title: 'Will marine fuel prices exceed $800/ton by Q2 2025?',
      description: 'Based on Rotterdam bunker fuel spot prices',
      icon: Fuel,
      status: 'active',
      volume: 1847000,
      liquidity: 650000,
      endDate: '2025-06-30',
      participants: 8965,
      yesPrice: 0.42,
      noPrice: 0.58,
      createdBy: '0x8B3a...7E5F',
      resolutionSource: 'Ship & Bunker Price Index',
      tags: ['Fuel', 'Energy', 'Maritime'],
      trending: false,
      featured: false
    },
    {
      id: 'MKT-003',
      category: 'Air Freight',
      title: 'Will global air cargo volume grow >5% in 2025?',
      description: 'Year-over-year growth based on IATA statistics',
      icon: Plane,
      status: 'active',
      volume: 985000,
      liquidity: 425000,
      endDate: '2025-12-31',
      participants: 5847,
      yesPrice: 0.68,
      noPrice: 0.32,
      createdBy: '0x5C2d...9A1B',
      resolutionSource: 'IATA CargoIS',
      tags: ['Aviation', 'Cargo', 'Growth'],
      trending: true,
      featured: false
    },
    {
      id: 'MKT-004',
      category: 'Port Congestion',
      title: 'Will LA/Long Beach port wait times exceed 10 days in Q1?',
      description: 'Average vessel wait time at anchor',
      icon: Anchor,
      status: 'active',
      volume: 1256000,
      liquidity: 520000,
      endDate: '2025-03-31',
      participants: 7458,
      yesPrice: 0.31,
      noPrice: 0.69,
      createdBy: '0x9F4e...2D8C',
      resolutionSource: 'Marine Exchange LA',
      tags: ['Ports', 'US West Coast', 'Congestion'],
      trending: false,
      featured: true
    },
    {
      id: 'MKT-005',
      category: 'Container Rates',
      title: 'Will Shanghai-LA container rates stay above $5000/FEU?',
      description: 'Spot rates for 40ft containers',
      icon: Container,
      status: 'active',
      volume: 3250000,
      liquidity: 1250000,
      endDate: '2025-04-30',
      participants: 15847,
      yesPrice: 0.76,
      noPrice: 0.24,
      createdBy: '0x3A7b...6E9D',
      resolutionSource: 'Freightos Baltic Index',
      tags: ['Container', 'Rates', 'Trans-Pacific'],
      trending: true,
      featured: true
    },
    {
      id: 'MKT-006',
      category: 'Trucking',
      title: 'Will US trucking capacity shortage continue through 2025?',
      description: 'Based on DAT Load-to-Truck ratio > 5.0',
      icon: Truck,
      status: 'resolved',
      volume: 4580000,
      liquidity: 0,
      endDate: '2025-01-15',
      participants: 18965,
      yesPrice: 0.89,
      noPrice: 0.11,
      createdBy: '0x6D8f...4B2A',
      resolutionSource: 'DAT Freight Analytics',
      tags: ['Trucking', 'Capacity', 'US Domestic'],
      trending: false,
      featured: false,
      resolution: 'YES',
      resolvedDate: '2025-01-15'
    }
  ];

  // Market Categories
  const categories = [
    { name: 'All Markets', count: 156, icon: Globe },
    { name: 'Shipping', count: 45, icon: Ship },
    { name: 'Air Freight', count: 28, icon: Plane },
    { name: 'Trucking', count: 32, icon: Truck },
    { name: 'Fuel Prices', count: 18, icon: Fuel },
    { name: 'Port Congestion', count: 15, icon: Anchor },
    { name: 'Container Rates', count: 18, icon: Container }
  ];

  // User Positions
  const userPositions = [
    {
      marketId: 'MKT-001',
      market: 'Suez Canal remains open',
      position: 'YES',
      shares: 1000,
      avgPrice: 0.72,
      currentPrice: 0.85,
      pnl: 180,
      pnlPercent: 18.05
    },
    {
      marketId: 'MKT-003',
      market: 'Air cargo volume growth >5%',
      position: 'NO',
      shares: 500,
      avgPrice: 0.45,
      currentPrice: 0.32,
      pnl: 65,
      pnlPercent: 28.88
    },
    {
      marketId: 'MKT-005',
      market: 'Shanghai-LA rates > $5000',
      position: 'YES',
      shares: 2000,
      avgPrice: 0.68,
      currentPrice: 0.76,
      pnl: 160,
      pnlPercent: 11.76
    }
  ];

  // Leaderboard
  const leaderboard = [
    { rank: 1, address: '0x742d...35C9', profit: 125847, accuracy: 78.5, markets: 145 },
    { rank: 2, address: '0x8B3a...7E5F', profit: 98654, accuracy: 72.3, markets: 98 },
    { rank: 3, address: '0x5C2d...9A1B', profit: 87456, accuracy: 81.2, markets: 67 },
    { rank: 4, address: '0x9F4e...2D8C', profit: 76543, accuracy: 69.8, markets: 124 },
    { rank: 5, address: '0x3A7b...6E9D', profit: 65432, accuracy: 75.4, markets: 89 }
  ];

  // Market Activity
  const recentActivity = [
    {
      type: 'bet',
      user: '0x742d...35C9',
      market: 'Suez Canal remains open',
      position: 'YES',
      amount: 5000,
      time: '2 min ago'
    },
    {
      type: 'liquidity',
      user: '0x8B3a...7E5F',
      market: 'Marine fuel prices > $800',
      amount: 10000,
      time: '5 min ago'
    },
    {
      type: 'resolution',
      market: 'US trucking capacity shortage',
      outcome: 'YES',
      payout: 458000,
      time: '1 hour ago'
    },
    {
      type: 'bet',
      user: '0x5C2d...9A1B',
      market: 'Air cargo volume growth',
      position: 'NO',
      amount: 2500,
      time: '2 hours ago'
    }
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
    return `$${num}`;
  };

  const calculatePotentialReturn = () => {
    const amount = parseFloat(betAmount) || 0;
    const price = selectedOutcome === 'yes' ? 
      markets.find(m => m.id === selectedMarket)?.yesPrice || 0 :
      markets.find(m => m.id === selectedMarket)?.noPrice || 0;
    
    const shares = amount / price;
    const potentialReturn = shares * 1; // If wins, each share worth $1
    const profit = potentialReturn - amount;
    
    return { shares, potentialReturn, profit, roi: (profit / amount) * 100 };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'resolved': return 'bg-blue-500';
      case 'disputed': return 'bg-yellow-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'bet': return <Target className="h-4 w-4" />;
      case 'liquidity': return <Database className="h-4 w-4" />;
      case 'resolution': return <CheckCircle2 className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Prediction Markets
            </h1>
            <p className="text-muted-foreground mt-2">
              Trade on future logistics events and earn from accurate predictions
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Trophy className="h-4 w-4 mr-2" />
              Leaderboard
            </Button>
            <Button variant="outline">
              <HelpCircle className="h-4 w-4 mr-2" />
              How It Works
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Market
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Volume</p>
                  <p className="text-2xl font-bold">$24.8M</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Markets</p>
                  <p className="text-2xl font-bold">156</p>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Traders</p>
                  <p className="text-2xl font-bold">45.6K</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Accuracy</p>
                  <p className="text-2xl font-bold">74.2%</p>
                </div>
                <Target className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">24h Volume</p>
                  <p className="text-2xl font-bold">$2.4M</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="markets" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="markets">Markets</TabsTrigger>
          <TabsTrigger value="positions">My Positions</TabsTrigger>
          <TabsTrigger value="create">Create Market</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Markets Tab */}
        <TabsContent value="markets" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Prediction Markets</CardTitle>
                  <CardDescription>Trade on logistics and supply chain events</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Search markets..." className="w-[200px]" />
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.name} value={cat.name.toLowerCase().replace(' ', '-')}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {markets.map((market) => {
                  const Icon = market.icon;
                  return (
                    <motion.div
                      key={market.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => setSelectedMarket(market.id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={getStatusColor(market.status)}>
                                {market.status.toUpperCase()}
                              </Badge>
                              <Badge variant="outline">{market.category}</Badge>
                              {market.trending && (
                                <Badge variant="secondary">
                                  <Flame className="h-3 w-3 mr-1" />
                                  Trending
                                </Badge>
                              )}
                              {market.featured && (
                                <Badge variant="secondary">
                                  <Star className="h-3 w-3 mr-1" />
                                  Featured
                                </Badge>
                              )}
                            </div>
                            <h3 className="text-lg font-semibold mb-1">{market.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{market.description}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Ends: {market.endDate}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {market.participants.toLocaleString()} traders
                              </span>
                              <span className="flex items-center gap-1">
                                <Shield className="h-3 w-3" />
                                {market.resolutionSource}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Price Display */}
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">YES</span>
                            <ThumbsUp className="h-4 w-4 text-green-500" />
                          </div>
                          <div className="text-2xl font-bold text-green-600">
                            ${market.yesPrice.toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {(market.yesPrice * 100).toFixed(1)}% implied odds
                          </div>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">NO</span>
                            <ThumbsDown className="h-4 w-4 text-red-500" />
                          </div>
                          <div className="text-2xl font-bold text-red-600">
                            ${market.noPrice.toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {(market.noPrice * 100).toFixed(1)}% implied odds
                          </div>
                        </div>
                      </div>

                      {/* Market Stats */}
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Volume</p>
                          <p className="font-semibold">{formatNumber(market.volume)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Liquidity</p>
                          <p className="font-semibold">{formatNumber(market.liquidity)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Created by</p>
                          <p className="font-semibold">{market.createdBy}</p>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mt-3">
                        {market.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Action Buttons */}
                      {market.status === 'active' && (
                        <div className="flex items-center gap-2 mt-4">
                          <Button size="sm" className="flex-1">
                            <DollarSign className="h-4 w-4 mr-1" />
                            Trade
                          </Button>
                          <Button size="sm" variant="outline">
                            <Info className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                          <Button size="sm" variant="outline">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}

                      {market.status === 'resolved' && (
                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              Resolved: {market.resolution}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {market.resolvedDate}
                            </span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Positions Tab */}
        <TabsContent value="positions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Positions</CardTitle>
              <CardDescription>Track your active predictions and P&L</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userPositions.map((position) => (
                  <div key={position.marketId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{position.market}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={position.position === 'YES' ? 'default' : 'destructive'}>
                            {position.position}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {position.shares} shares @ ${position.avgPrice}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "text-lg font-bold",
                          position.pnl >= 0 ? 'text-green-500' : 'text-red-500'
                        )}>
                          {position.pnl >= 0 ? '+' : ''}{formatNumber(position.pnl)}
                        </p>
                        <p className={cn(
                          "text-sm",
                          position.pnlPercent >= 0 ? 'text-green-500' : 'text-red-500'
                        )}>
                          {position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Avg Price</p>
                        <p className="font-semibold">${position.avgPrice}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Current Price</p>
                        <p className="font-semibold">${position.currentPrice}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Value</p>
                        <p className="font-semibold">
                          ${(position.shares * position.currentPrice).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" className="flex-1">
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Minus className="h-4 w-4 mr-1" />
                        Sell
                      </Button>
                    </div>
                  </div>
                ))}

                <Card className="bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Invested</p>
                        <p className="text-lg font-bold">$3,425</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Current Value</p>
                        <p className="text-lg font-bold">$3,830</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total P&L</p>
                        <p className="text-lg font-bold text-green-500">+$405</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">ROI</p>
                        <p className="text-lg font-bold text-green-500">+11.82%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create Market Tab */}
        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Market</CardTitle>
              <CardDescription>
                Create a prediction market for logistics events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Market Question</Label>
                <Input placeholder="Will [specific event] happen by [date]?" />
              </div>

              <div>
                <Label>Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.slice(1).map(cat => (
                      <SelectItem key={cat.name} value={cat.name.toLowerCase()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Resolution Source</Label>
                <Input placeholder="e.g., Official port authority data" />
              </div>

              <div>
                <Label>End Date</Label>
                <Input type="date" />
              </div>

              <div>
                <Label>Initial Liquidity (USDT)</Label>
                <Input type="number" placeholder="Minimum 1000 USDT" />
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Creating a market requires 100 MOLOCHAIN tokens as a fee and minimum 
                  1000 USDT initial liquidity. Markets are resolved by community oracle.
                </AlertDescription>
              </Alert>

              <Button className="w-full" size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Create Market
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Predictors</CardTitle>
              <CardDescription>Best performing traders this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard.map((trader) => (
                  <div key={trader.rank} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-bold",
                        trader.rank === 1 && "bg-yellow-500 text-white",
                        trader.rank === 2 && "bg-gray-400 text-white",
                        trader.rank === 3 && "bg-orange-600 text-white",
                        trader.rank > 3 && "bg-muted"
                      )}>
                        {trader.rank}
                      </div>
                      <div>
                        <p className="font-semibold">{trader.address}</p>
                        <p className="text-sm text-muted-foreground">
                          {trader.markets} markets traded
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-500">
                          {formatNumber(trader.profit)}
                        </p>
                        <p className="text-sm text-muted-foreground">Profit</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold">{trader.accuracy}%</p>
                        <p className="text-sm text-muted-foreground">Accuracy</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest trades and market updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getActivityIcon(activity.type)}
                      <div>
                        {activity.type === 'bet' && (
                          <>
                            <p className="font-medium">
                              {activity.user} bet {formatNumber(activity.amount!)} on{' '}
                              <span className={activity.position === 'YES' ? 'text-green-500' : 'text-red-500'}>
                                {activity.position}
                              </span>
                            </p>
                            <p className="text-sm text-muted-foreground">{activity.market}</p>
                          </>
                        )}
                        {activity.type === 'liquidity' && (
                          <>
                            <p className="font-medium">
                              {activity.user} added {formatNumber(activity.amount!)} liquidity
                            </p>
                            <p className="text-sm text-muted-foreground">{activity.market}</p>
                          </>
                        )}
                        {activity.type === 'resolution' && (
                          <>
                            <p className="font-medium">
                              Market resolved: {activity.outcome}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {activity.market} • Payout: {formatNumber(activity.payout!)}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Trading Modal */}
      {selectedMarket && (
        <Card className="fixed bottom-4 right-4 w-96 shadow-xl z-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Quick Trade</CardTitle>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedMarket(null)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Outcome</Label>
              <RadioGroup value={selectedOutcome} onValueChange={setSelectedOutcome}>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="yes" />
                    <Label htmlFor="yes" className="cursor-pointer">YES</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="no" />
                    <Label htmlFor="no" className="cursor-pointer">NO</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>Amount (USDT)</Label>
              <Input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shares</span>
                <span>{calculatePotentialReturn().shares.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Potential Return</span>
                <span className="text-green-500">
                  ${calculatePotentialReturn().potentialReturn.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Potential Profit</span>
                <span className="text-green-500 font-bold">
                  +${calculatePotentialReturn().profit.toFixed(2)} 
                  ({calculatePotentialReturn().roi.toFixed(1)}%)
                </span>
              </div>
            </div>

            <Button className="w-full">
              <Target className="h-4 w-4 mr-2" />
              Place Prediction
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Add missing icons
const Plus = ({ className = "h-4 w-4" }: { className?: string }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
const Minus = ({ className = "h-4 w-4" }: { className?: string }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>;

export default PredictionMarket;