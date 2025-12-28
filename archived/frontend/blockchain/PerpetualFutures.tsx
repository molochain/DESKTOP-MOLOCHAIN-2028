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
  TrendingDown,
  DollarSign,
  Activity,
  BarChart3,
  AlertTriangle,
  Info,
  Lock,
  Unlock,
  Zap,
  Target,
  Shield,
  Clock,
  Users,
  ChevronUp,
  ChevronDown,
  Minus,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  Wallet,
  Settings,
  HelpCircle,
  ExternalLink,
  RefreshCw,
  Timer,
  Gauge,
  Package,
  Truck,
  Ship,
  Plane,
  Wheat,
  Fuel,
  Factory,
  Container,
  Scale,
  LineChart,
  CandlestickChart,
  PieChart,
  Layers,
  GitBranch,
  Coins,
  Receipt,
  FileText,
  Award,
  Trophy,
  Crown,
  Star,
  Flame,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Sparkles,
  Database,
  Brain,
  Eye,
  EyeOff,
  Moon,
  Sun,
  Crosshair,
  Hash,
  Percent,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const PerpetualFutures = () => {
  const [selectedMarket, setSelectedMarket] = useState('BTC-PERP');
  const [orderType, setOrderType] = useState('market');
  const [positionSize, setPositionSize] = useState('1000');
  const [leverage, setLeverage] = useState([10]);
  const [isLong, setIsLong] = useState(true);
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [marginType, setMarginType] = useState('isolated');

  // Markets Data
  const futuresMarkets = [
    {
      symbol: 'WHEAT-PERP',
      name: 'Wheat Perpetual',
      icon: Wheat,
      category: 'Agriculture',
      price: 285.45,
      change24h: 2.8,
      volume24h: 12500000,
      openInterest: 45000000,
      fundingRate: 0.01,
      markPrice: 285.52,
      indexPrice: 285.38,
      nextFunding: '3h 45m',
      maxLeverage: 20
    },
    {
      symbol: 'OIL-PERP',
      name: 'Crude Oil Perpetual',
      icon: Fuel,
      category: 'Energy',
      price: 78.92,
      change24h: -1.5,
      volume24h: 85000000,
      openInterest: 250000000,
      fundingRate: -0.005,
      markPrice: 78.95,
      indexPrice: 78.88,
      nextFunding: '3h 45m',
      maxLeverage: 50
    },
    {
      symbol: 'STEEL-PERP',
      name: 'Steel Perpetual',
      icon: Factory,
      category: 'Metals',
      price: 642.30,
      change24h: 0.8,
      volume24h: 8500000,
      openInterest: 32000000,
      fundingRate: 0.008,
      markPrice: 642.35,
      indexPrice: 642.25,
      nextFunding: '3h 45m',
      maxLeverage: 25
    },
    {
      symbol: 'FREIGHT-PERP',
      name: 'Baltic Freight Index',
      icon: Ship,
      category: 'Logistics',
      price: 1847.50,
      change24h: 4.2,
      volume24h: 5600000,
      openInterest: 18000000,
      fundingRate: 0.015,
      markPrice: 1848.20,
      indexPrice: 1846.80,
      nextFunding: '3h 45m',
      maxLeverage: 15
    },
    {
      symbol: 'CONTAINER-PERP',
      name: 'Container Rate Index',
      icon: Container,
      category: 'Logistics',
      price: 3250.00,
      change24h: -2.1,
      volume24h: 9800000,
      openInterest: 28000000,
      fundingRate: -0.002,
      markPrice: 3251.50,
      indexPrice: 3248.50,
      nextFunding: '3h 45m',
      maxLeverage: 20
    },
    {
      symbol: 'AIRFREIGHT-PERP',
      name: 'Air Freight Index',
      icon: Plane,
      category: 'Logistics',
      price: 4.85,
      change24h: 1.2,
      volume24h: 3200000,
      openInterest: 12000000,
      fundingRate: 0.012,
      markPrice: 4.86,
      indexPrice: 4.84,
      nextFunding: '3h 45m',
      maxLeverage: 10
    }
  ];

  // Active Positions
  const positions = [
    {
      id: 'POS-001',
      market: 'WHEAT-PERP',
      side: 'LONG',
      size: 10000,
      entryPrice: 280.50,
      markPrice: 285.45,
      pnl: 495,
      pnlPercent: 17.65,
      margin: 2805,
      leverage: 10,
      liquidationPrice: 252.45,
      marginRatio: 15.2
    },
    {
      id: 'POS-002',
      market: 'OIL-PERP',
      side: 'SHORT',
      size: 5000,
      entryPrice: 82.30,
      markPrice: 78.92,
      pnl: 1690,
      pnlPercent: 41.08,
      margin: 4115,
      leverage: 20,
      liquidationPrice: 94.65,
      marginRatio: 8.5
    },
    {
      id: 'POS-003',
      market: 'FREIGHT-PERP',
      side: 'LONG',
      size: 2000,
      entryPrice: 1780.00,
      markPrice: 1847.50,
      pnl: 135,
      pnlPercent: 3.79,
      margin: 3560,
      leverage: 5,
      liquidationPrice: 1424.00,
      marginRatio: 22.8
    }
  ];

  // Order Book
  const orderBook = {
    asks: [
      { price: 285.52, size: 12500, total: 12500 },
      { price: 285.54, size: 8900, total: 21400 },
      { price: 285.56, size: 15200, total: 36600 },
      { price: 285.58, size: 6700, total: 43300 },
      { price: 285.60, size: 18900, total: 62200 }
    ],
    bids: [
      { price: 285.44, size: 10200, total: 10200 },
      { price: 285.42, size: 14500, total: 24700 },
      { price: 285.40, size: 9800, total: 34500 },
      { price: 285.38, size: 11200, total: 45700 },
      { price: 285.36, size: 16800, total: 62500 }
    ]
  };

  // Recent Trades
  const recentTrades = [
    { time: '16:42:58', price: 285.45, size: 2500, side: 'BUY' },
    { time: '16:42:55', price: 285.44, size: 1800, side: 'SELL' },
    { time: '16:42:52', price: 285.46, size: 3200, side: 'BUY' },
    { time: '16:42:48', price: 285.43, size: 900, side: 'SELL' },
    { time: '16:42:45', price: 285.47, size: 5600, side: 'BUY' },
    { time: '16:42:41', price: 285.42, size: 2100, side: 'SELL' }
  ];

  // Funding History
  const fundingHistory = [
    { time: '12:00:00', rate: 0.010, payment: 25.45 },
    { time: '08:00:00', rate: 0.008, payment: 20.12 },
    { time: '04:00:00', rate: 0.012, payment: 30.78 },
    { time: '00:00:00', rate: -0.005, payment: -12.85 }
  ];

  const selectedMarketData = futuresMarkets.find(m => m.symbol === selectedMarket) || futuresMarkets[0];

  const calculateLiquidationPrice = () => {
    const size = parseFloat(positionSize) || 0;
    const lev = leverage[0];
    const price = selectedMarketData.price;
    
    if (isLong) {
      return price * (1 - 1 / lev + 0.005); // 0.5% maintenance margin
    } else {
      return price * (1 + 1 / lev - 0.005);
    }
  };

  const calculateMargin = () => {
    const size = parseFloat(positionSize) || 0;
    const lev = leverage[0];
    return size / lev;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
    return `$${num.toFixed(2)}`;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const liquidationPrice = calculateLiquidationPrice();
  const requiredMargin = calculateMargin();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Perpetual Futures
            </h1>
            <p className="text-muted-foreground mt-2">
              Trade commodity and logistics futures with up to 50x leverage
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
              Deposit
            </Button>
          </div>
        </div>

        {/* Account Stats */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Account Balance</p>
                  <p className="text-2xl font-bold">$125.8K</p>
                </div>
                <Wallet className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Unrealized PNL</p>
                  <p className="text-2xl font-bold text-green-500">+$2,320</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Margin Used</p>
                  <p className="text-2xl font-bold">$10.5K</p>
                </div>
                <Lock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Free Margin</p>
                  <p className="text-2xl font-bold">$115.3K</p>
                </div>
                <Unlock className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Margin Level</p>
                  <p className="text-2xl font-bold">1,198%</p>
                </div>
                <Gauge className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Open Positions</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <Layers className="h-8 w-8 text-indigo-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Trading Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Market List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Markets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
            {futuresMarkets.map((market) => {
              const Icon = market.icon;
              return (
                <motion.div
                  key={market.symbol}
                  whileHover={{ scale: 1.02 }}
                  className={cn(
                    "p-3 rounded-lg cursor-pointer transition-all",
                    selectedMarket === market.symbol 
                      ? "bg-primary/10 border border-primary" 
                      : "hover:bg-muted/50"
                  )}
                  onClick={() => setSelectedMarket(market.symbol)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-semibold text-sm">{market.symbol}</p>
                        <p className="text-xs text-muted-foreground">{market.name}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold">${market.price.toFixed(2)}</p>
                      <p className={cn("text-xs", getChangeColor(market.change24h))}>
                        {market.change24h > 0 ? '+' : ''}{market.change24h}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">24h Vol</p>
                      <p className="text-xs font-semibold">
                        {formatNumber(market.volume24h)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>

        {/* Trading Panel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Trade {selectedMarketData.symbol}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{selectedMarketData.category}</Badge>
                <Badge className="bg-green-500">
                  Max {selectedMarketData.maxLeverage}x
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Market Info */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">Mark Price</p>
                <p className="font-semibold">${selectedMarketData.markPrice}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Index Price</p>
                <p className="font-semibold">${selectedMarketData.indexPrice}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Funding / 8h</p>
                <p className={cn(
                  "font-semibold",
                  selectedMarketData.fundingRate >= 0 ? 'text-green-500' : 'text-red-500'
                )}>
                  {selectedMarketData.fundingRate}%
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">24h High</p>
                <p className="font-semibold">${(selectedMarketData.price * 1.05).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">24h Low</p>
                <p className="font-semibold">${(selectedMarketData.price * 0.95).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Open Interest</p>
                <p className="font-semibold">{formatNumber(selectedMarketData.openInterest)}</p>
              </div>
            </div>

            {/* Order Type Selection */}
            <Tabs value={orderType} onValueChange={setOrderType}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="market">Market</TabsTrigger>
                <TabsTrigger value="limit">Limit</TabsTrigger>
                <TabsTrigger value="stop">Stop</TabsTrigger>
              </TabsList>

              <TabsContent value="market" className="space-y-4">
                {/* Buy/Sell Toggle */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={isLong ? "default" : "outline"}
                    className={cn(isLong && "bg-green-600 hover:bg-green-700")}
                    onClick={() => setIsLong(true)}
                  >
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Long / Buy
                  </Button>
                  <Button
                    variant={!isLong ? "default" : "outline"}
                    className={cn(!isLong && "bg-red-600 hover:bg-red-700")}
                    onClick={() => setIsLong(false)}
                  >
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Short / Sell
                  </Button>
                </div>

                {/* Size Input */}
                <div>
                  <Label>Size (USD)</Label>
                  <Input
                    type="number"
                    value={positionSize}
                    onChange={(e) => setPositionSize(e.target.value)}
                    placeholder="Enter position size"
                  />
                </div>

                {/* Leverage Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Leverage</Label>
                    <span className="text-lg font-bold">{leverage[0]}x</span>
                  </div>
                  <Slider
                    value={leverage}
                    onValueChange={setLeverage}
                    max={selectedMarketData.maxLeverage}
                    min={1}
                    step={1}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1x</span>
                    <span>{Math.floor(selectedMarketData.maxLeverage / 2)}x</span>
                    <span>{selectedMarketData.maxLeverage}x</span>
                  </div>
                </div>

                {/* Margin Type */}
                <div>
                  <Label>Margin Type</Label>
                  <Select value={marginType} onValueChange={setMarginType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="isolated">Isolated</SelectItem>
                      <SelectItem value="cross">Cross</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* TP/SL */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Take Profit</Label>
                    <Input
                      type="number"
                      value={takeProfit}
                      onChange={(e) => setTakeProfit(e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <Label>Stop Loss</Label>
                    <Input
                      type="number"
                      value={stopLoss}
                      onChange={(e) => setStopLoss(e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                </div>

                {/* Order Summary */}
                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Margin Required</span>
                    <span className="font-semibold">${requiredMargin.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Entry Price</span>
                    <span className="font-semibold">${selectedMarketData.price}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Liquidation Price</span>
                    <span className="font-semibold text-orange-500">
                      ${liquidationPrice.toFixed(2)}
                    </span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between">
                    <span className="font-semibold">Total Cost</span>
                    <span className="font-bold text-lg">${requiredMargin.toFixed(2)}</span>
                  </div>
                </div>

                {/* Place Order Button */}
                <Button 
                  className={cn(
                    "w-full",
                    isLong ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                  )}
                  size="lg"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  {isLong ? 'Open Long' : 'Open Short'} Position
                </Button>
              </TabsContent>

              <TabsContent value="limit" className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Limit orders allow you to set a specific entry price. Order will only execute 
                    when market reaches your specified price.
                  </AlertDescription>
                </Alert>
              </TabsContent>

              <TabsContent value="stop" className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Stop orders trigger when price reaches a specified level, helping you enter 
                    breakouts or limit losses.
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Order Book & Trades */}
        <Card className="lg:col-span-1">
          <Tabs defaultValue="orderbook">
            <CardHeader>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="orderbook">Order Book</TabsTrigger>
                <TabsTrigger value="trades">Trades</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="orderbook" className="space-y-2">
                {/* Asks */}
                <div className="space-y-1">
                  {orderBook.asks.reverse().map((ask, index) => (
                    <div key={index} className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-red-500 text-right">{ask.price}</div>
                      <div className="text-right">{ask.size.toLocaleString()}</div>
                      <div className="text-right text-muted-foreground">
                        {ask.total.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Current Price */}
                <div className="py-2 border-y">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-500">
                      ${selectedMarketData.price}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ≈ ${selectedMarketData.price}
                    </p>
                  </div>
                </div>

                {/* Bids */}
                <div className="space-y-1">
                  {orderBook.bids.map((bid, index) => (
                    <div key={index} className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-green-500 text-right">{bid.price}</div>
                      <div className="text-right">{bid.size.toLocaleString()}</div>
                      <div className="text-right text-muted-foreground">
                        {bid.total.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="trades" className="space-y-1">
                {recentTrades.map((trade, index) => (
                  <div key={index} className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-muted-foreground">{trade.time}</div>
                    <div className={cn(
                      "text-right",
                      trade.side === 'BUY' ? 'text-green-500' : 'text-red-500'
                    )}>
                      {trade.price}
                    </div>
                    <div className="text-right">{trade.size.toLocaleString()}</div>
                  </div>
                ))}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>

      {/* Positions & Orders */}
      <Tabs defaultValue="positions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="orders">Open Orders</TabsTrigger>
          <TabsTrigger value="history">Trade History</TabsTrigger>
          <TabsTrigger value="funding">Funding</TabsTrigger>
        </TabsList>

        <TabsContent value="positions">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Active Positions</CardTitle>
                <Button variant="outline" size="sm">
                  <XCircle className="h-4 w-4 mr-1" />
                  Close All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {positions.map((position) => (
                  <div key={position.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge className={cn(
                          position.side === 'LONG' ? 'bg-green-500' : 'bg-red-500'
                        )}>
                          {position.side}
                        </Badge>
                        <div>
                          <p className="font-semibold">{position.market}</p>
                          <p className="text-sm text-muted-foreground">
                            {position.leverage}x Leverage • Isolated
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "text-xl font-bold",
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

                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Size</p>
                        <p className="font-semibold">{formatNumber(position.size)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Entry Price</p>
                        <p className="font-semibold">${position.entryPrice}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Mark Price</p>
                        <p className="font-semibold">${position.markPrice}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Liq. Price</p>
                        <p className="font-semibold text-orange-500">
                          ${position.liquidationPrice}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">Margin Ratio</span>
                        <span className="text-xs font-semibold">{position.marginRatio}%</span>
                      </div>
                      <Progress 
                        value={position.marginRatio} 
                        className={cn(
                          "h-2",
                          position.marginRatio < 10 && "[&>div]:bg-red-500",
                          position.marginRatio >= 10 && position.marginRatio < 20 && "[&>div]:bg-yellow-500",
                          position.marginRatio >= 20 && "[&>div]:bg-green-500"
                        )}
                      />
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Minus className="h-4 w-4 mr-1" />
                        Reduce
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Settings className="h-4 w-4 mr-1" />
                        TP/SL
                      </Button>
                      <Button size="sm" variant="destructive">
                        <XCircle className="h-4 w-4 mr-1" />
                        Close
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No open orders</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No trade history</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funding">
          <Card>
            <CardHeader>
              <CardTitle>Funding History</CardTitle>
              <CardDescription>Your funding payments for the last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {fundingHistory.map((funding, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-semibold">WHEAT-PERP</p>
                      <p className="text-sm text-muted-foreground">{funding.time}</p>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "font-semibold",
                        funding.rate >= 0 ? 'text-green-500' : 'text-red-500'
                      )}>
                        {funding.rate >= 0 ? '+' : ''}{funding.rate}%
                      </p>
                      <p className={cn(
                        "text-sm",
                        funding.payment >= 0 ? 'text-green-500' : 'text-red-500'
                      )}>
                        {funding.payment >= 0 ? 'Received' : 'Paid'} ${Math.abs(funding.payment)}
                      </p>
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

export default PerpetualFutures;