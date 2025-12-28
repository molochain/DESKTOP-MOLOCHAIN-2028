import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  ComposedChart,
  Scatter
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  Activity,
  Eye,
  EyeOff,
  Bell,
  BellOff,
  RefreshCw,
  Download,
  Upload,
  Plus,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Calendar,
  Target,
  Award,
  Shield,
  Lock,
  Unlock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Info,
  ChevronRight,
  ChevronDown,
  Filter,
  Search,
  Settings,
  Share2,
  Copy,
  ExternalLink,
  PieChart as PieChartIcon,
  BarChart3,
  LineChart as LineChartIcon,
  Briefcase,
  Building,
  Coins,
  CreditCard,
  Receipt,
  FileText,
  Calculator,
  Percent,
  Hash,
  Zap,
  Flame,
  Droplets,
  Wind,
  Cloud,
  Sun,
  Moon,
  Star,
  Heart,
  Bookmark,
  Send,
  Archive,
  Trash2,
  Edit,
  Save,
  X,
  Check,
  AlertTriangle,
  HelpCircle,
  MessageSquare,
  User,
  Users,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  Globe,
  Map,
  Navigation,
  Compass,
  Cpu,
  Database,
  Server,
  Wifi,
  WifiOff,
  Battery,
  BatteryCharging,
  Smartphone,
  Monitor,
  Tv,
  Radio,
  Speaker,
  Headphones,
  Mic,
  Camera,
  Video,
  Image,
  Film,
  Music,
  Volume,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  FastForward,
  Rewind,
  Repeat,
  Shuffle,
  List,
  Grid,
  Layers,
  Layout,
  Maximize,
  Minimize,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Octagon,
  Package,
  Box,
  Gift,
  ShoppingCart,
  ShoppingBag,
  Tag,
  Tags,
  Ticket,
  Gem,
  Crown,
  Medal,
  Trophy,
  Flag,
  Rocket,
  Plane,
  Car,
  Truck,
  Ship,
  Anchor,
  Crosshair,
  Move,
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  Github,
  Gitlab,
  Terminal,
  Code,
  Command
} from 'lucide-react';

const InvestmentTracking = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showPrivateInfo, setShowPrivateInfo] = useState(true);
  const [selectedPortfolio, setSelectedPortfolio] = useState('all');
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  // Portfolio Overview Data
  const portfolioSummary = {
    totalValue: '$2,847,523',
    totalInvested: '$1,950,000',
    totalReturn: '$897,523',
    returnPercentage: '+46.03%',
    dayChange: '+$45,234',
    dayChangePercent: '+1.62%',
    portfolios: [
      { name: 'DeFi Portfolio', value: '$1,234,567', weight: '43.4%' },
      { name: 'Staking Rewards', value: '$876,543', weight: '30.8%' },
      { name: 'Liquidity Pools', value: '$456,789', weight: '16.0%' },
      { name: 'NFT Assets', value: '$279,624', weight: '9.8%' }
    ]
  };

  // Real-time Investment Performance
  const performanceData = [
    { time: '00:00', portfolio: 2750000, benchmark: 2700000, predicted: 2760000 },
    { time: '04:00', portfolio: 2780000, benchmark: 2720000, predicted: 2785000 },
    { time: '08:00', portfolio: 2810000, benchmark: 2740000, predicted: 2815000 },
    { time: '12:00', portfolio: 2825000, benchmark: 2750000, predicted: 2830000 },
    { time: '16:00', portfolio: 2840000, benchmark: 2760000, predicted: 2845000 },
    { time: '20:00', portfolio: 2847523, benchmark: 2765000, predicted: 2850000 },
    { time: '24:00', portfolio: 2855000, benchmark: 2770000, predicted: 2860000 }
  ];

  // Active Investments
  const activeInvestments = [
    {
      id: '1',
      name: 'MOLOCHAIN Staking Pool V3',
      type: 'Staking',
      amount: '$450,000',
      currentValue: '$523,450',
      roi: '+16.3%',
      apy: '18.5%',
      status: 'Active',
      duration: '180 days',
      risk: 'Low',
      rewards: '$2,345/day'
    },
    {
      id: '2',
      name: 'MOLO/USDT Liquidity Pool',
      type: 'Liquidity',
      amount: '$380,000',
      currentValue: '$412,340',
      roi: '+8.5%',
      apy: '24.7%',
      status: 'Active',
      duration: '90 days',
      risk: 'Medium',
      rewards: '$1,876/day'
    },
    {
      id: '3',
      name: 'DeFi Yield Optimizer',
      type: 'Yield Farming',
      amount: '$275,000',
      currentValue: '$334,250',
      roi: '+21.5%',
      apy: '32.4%',
      status: 'Active',
      duration: '45 days',
      risk: 'High',
      rewards: '$3,124/day'
    },
    {
      id: '4',
      name: 'NFT Logistics Collection',
      type: 'NFT',
      amount: '$180,000',
      currentValue: '$279,624',
      roi: '+55.3%',
      apy: 'N/A',
      status: 'Holding',
      duration: '120 days',
      risk: 'Very High',
      rewards: 'N/A'
    },
    {
      id: '5',
      name: 'Cross-Chain Bridge LP',
      type: 'Bridge Liquidity',
      amount: '$165,000',
      currentValue: '$178,450',
      roi: '+8.2%',
      apy: '15.3%',
      status: 'Active',
      duration: '60 days',
      risk: 'Medium',
      rewards: '$987/day'
    }
  ];

  // Transaction History
  const recentTransactions = [
    {
      id: 'tx1',
      type: 'Deposit',
      asset: 'MOLO',
      amount: '10,000',
      value: '$12,800',
      from: 'External Wallet',
      to: 'Staking Pool V3',
      time: '2 hours ago',
      status: 'Completed',
      hash: '0x1234...5678'
    },
    {
      id: 'tx2',
      type: 'Harvest',
      asset: 'MOLO',
      amount: '1,234',
      value: '$1,580',
      from: 'Yield Farm',
      to: 'Main Wallet',
      time: '5 hours ago',
      status: 'Completed',
      hash: '0xabcd...efgh'
    },
    {
      id: 'tx3',
      type: 'Swap',
      asset: 'USDT → MOLO',
      amount: '5,000',
      value: '$5,000',
      from: 'USDT',
      to: 'MOLO',
      time: '8 hours ago',
      status: 'Completed',
      hash: '0x9876...5432'
    },
    {
      id: 'tx4',
      type: 'Stake',
      asset: 'MOLO',
      amount: '25,000',
      value: '$32,000',
      from: 'Main Wallet',
      to: 'Staking Pool V3',
      time: '1 day ago',
      status: 'Completed',
      hash: '0xfedc...ba98'
    },
    {
      id: 'tx5',
      type: 'Claim',
      asset: 'MOLO',
      amount: '3,456',
      value: '$4,424',
      from: 'Staking Rewards',
      to: 'Main Wallet',
      time: '2 days ago',
      status: 'Completed',
      hash: '0x1357...2468'
    }
  ];

  // Asset Allocation
  const assetAllocation = [
    { name: 'MOLOCHAIN', value: 45, amount: '$1,281,385', color: '#3B82F6' },
    { name: 'Stablecoins', value: 20, amount: '$569,505', color: '#10B981' },
    { name: 'Ethereum', value: 15, amount: '$427,128', color: '#8B5CF6' },
    { name: 'Bitcoin', value: 10, amount: '$284,752', color: '#F59E0B' },
    { name: 'Other Alts', value: 10, amount: '$284,752', color: '#EF4444' }
  ];

  // Yield Opportunities
  const yieldOpportunities = [
    {
      protocol: 'MOLO Stake Max',
      apy: '42.8%',
      tvl: '$124M',
      risk: 'Medium',
      minInvestment: '$1,000',
      lockPeriod: '30 days',
      audited: true,
      insurance: true
    },
    {
      protocol: 'Liquidity Boost',
      apy: '38.5%',
      tvl: '$87M',
      risk: 'High',
      minInvestment: '$500',
      lockPeriod: 'None',
      audited: true,
      insurance: false
    },
    {
      protocol: 'Stable Farm',
      apy: '12.4%',
      tvl: '$456M',
      risk: 'Low',
      minInvestment: '$100',
      lockPeriod: 'None',
      audited: true,
      insurance: true
    },
    {
      protocol: 'Leverage Yield',
      apy: '78.3%',
      tvl: '$34M',
      risk: 'Very High',
      minInvestment: '$5,000',
      lockPeriod: '90 days',
      audited: false,
      insurance: false
    }
  ];

  // Risk Metrics
  const riskMetrics = {
    portfolioRisk: 'Medium',
    riskScore: 65,
    volatility: '18.4%',
    sharpeRatio: 1.82,
    maxDrawdown: '-12.3%',
    valueAtRisk: '$142,376',
    betaCoefficient: 1.15,
    correlationIndex: 0.72
  };

  // Price Alerts
  const priceAlerts = [
    { asset: 'MOLO', condition: 'Above', price: '$1.50', active: true },
    { asset: 'BTC', condition: 'Below', price: '$40,000', active: true },
    { asset: 'ETH', condition: 'Above', price: '$3,000', active: false },
    { asset: 'MOLO/USDT LP', condition: 'APY Above', price: '30%', active: true }
  ];

  // Investment Goals
  const investmentGoals = [
    { goal: 'Q1 Portfolio Target', target: '$3,000,000', current: '$2,847,523', progress: 94.9 },
    { goal: 'Annual ROI Target', target: '50%', current: '46.03%', progress: 92.1 },
    { goal: 'Passive Income/Month', target: '$25,000', current: '$23,450', progress: 93.8 },
    { goal: 'Risk Diversification', target: '5 Protocols', current: '4 Protocols', progress: 80 }
  ];

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        // Simulate real-time data updates
        // Refreshing investment data
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const formatCurrency = (value: string | number) => {
    if (typeof value === 'string') return value;
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'very high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'holding': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Real-Time Investment Tracking
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Monitor and manage your investment portfolio with live updates
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
                id="auto-refresh"
              />
              <Label htmlFor="auto-refresh" className="text-sm">Auto-refresh</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={showPrivateInfo}
                onCheckedChange={setShowPrivateInfo}
                id="show-private"
              />
              <Label htmlFor="show-private" className="text-sm">
                {showPrivateInfo ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Label>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                Total Portfolio Value
                <Briefcase className="h-5 w-5 opacity-80" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {showPrivateInfo ? portfolioSummary.totalValue : '****'}
              </div>
              <div className="flex items-center mt-2 text-blue-100">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span className="text-sm">{portfolioSummary.dayChange} ({portfolioSummary.dayChangePercent})</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                Total Return
                <TrendingUp className="h-5 w-5 opacity-80" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {showPrivateInfo ? portfolioSummary.totalReturn : '****'}
              </div>
              <div className="flex items-center mt-2 text-green-100">
                <Percent className="h-4 w-4 mr-1" />
                <span className="text-sm">{portfolioSummary.returnPercentage} all-time</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                Active Investments
                <Activity className="h-5 w-5 opacity-80" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeInvestments.length}</div>
              <div className="flex items-center mt-2 text-purple-100">
                <Clock className="h-4 w-4 mr-1" />
                <span className="text-sm">$8,332 daily rewards</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                Portfolio Health
                <Shield className="h-5 w-5 opacity-80" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{riskMetrics.riskScore}/100</div>
              <div className="flex items-center mt-2 text-orange-100">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span className="text-sm">Risk: {riskMetrics.portfolioRisk}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="investments">Investments</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Portfolio Performance Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Performance</CardTitle>
                  <CardDescription>Real-time portfolio value tracking</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={performanceData}>
                      <defs>
                        <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="benchmarkGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="time" />
                      <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                      <Tooltip formatter={(value: any) => formatCurrency(value)} />
                      <Legend />
                      <Area type="monotone" dataKey="portfolio" stroke="#3B82F6" fillOpacity={1} fill="url(#portfolioGradient)" name="Portfolio" strokeWidth={2} />
                      <Area type="monotone" dataKey="benchmark" stroke="#10B981" fillOpacity={1} fill="url(#benchmarkGradient)" name="S&P 500" strokeWidth={2} />
                      <Line type="monotone" dataKey="predicted" stroke="#8B5CF6" strokeDasharray="5 5" name="Predicted" strokeWidth={2} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Asset Allocation */}
              <Card>
                <CardHeader>
                  <CardTitle>Asset Allocation</CardTitle>
                  <CardDescription>Current portfolio distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={assetAllocation}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {assetAllocation.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any, name: any, props: any) => [
                        `${value}%`,
                        `Amount: ${props.payload.amount}`
                      ]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {assetAllocation.map((asset, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: asset.color }} />
                          <span>{asset.name}</span>
                        </div>
                        <span className="font-semibold">{asset.amount}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Investment Goals Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Investment Goals</CardTitle>
                <CardDescription>Track your progress towards financial targets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {investmentGoals.map((goal, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{goal.goal}</span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {goal.current} / {goal.target}
                        </span>
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                      <div className="text-xs text-right text-gray-500">
                        {goal.progress.toFixed(1)}% Complete
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Active Investments Tab */}
          <TabsContent value="investments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Investment Positions</CardTitle>
                <CardDescription>Monitor and manage your current investments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeInvestments.map((investment) => (
                    <div key={investment.id} className="p-4 rounded-lg border bg-white dark:bg-gray-800">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
                            {investment.type === 'Staking' && <Coins className="h-5 w-5 text-blue-600" />}
                            {investment.type === 'Liquidity' && <Droplets className="h-5 w-5 text-blue-600" />}
                            {investment.type === 'Yield Farming' && <Gem className="h-5 w-5 text-purple-600" />}
                            {investment.type === 'NFT' && <Image className="h-5 w-5 text-purple-600" />}
                            {investment.type === 'Bridge Liquidity' && <GitBranch className="h-5 w-5 text-green-600" />}
                          </div>
                          <div>
                            <h3 className="font-semibold">{investment.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Badge variant="outline" className={getStatusColor(investment.status)}>
                                {investment.status}
                              </Badge>
                              <span className={getRiskColor(investment.risk)}>
                                Risk: {investment.risk}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-2" />
                          Manage
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600 dark:text-gray-400">Invested</div>
                          <div className="font-semibold">{investment.amount}</div>
                        </div>
                        <div>
                          <div className="text-gray-600 dark:text-gray-400">Current Value</div>
                          <div className="font-semibold">{investment.currentValue}</div>
                        </div>
                        <div>
                          <div className="text-gray-600 dark:text-gray-400">ROI</div>
                          <div className={`font-semibold ${investment.roi.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                            {investment.roi}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600 dark:text-gray-400">APY</div>
                          <div className="font-semibold text-blue-600">{investment.apy}</div>
                        </div>
                        <div>
                          <div className="text-gray-600 dark:text-gray-400">Daily Rewards</div>
                          <div className="font-semibold text-green-600">{investment.rewards}</div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Duration: {investment.duration}
                        </span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                          <Button size="sm" variant="outline">
                            <Minus className="h-4 w-4 mr-1" />
                            Withdraw
                          </Button>
                          <Button size="sm" variant="outline">
                            <Gift className="h-4 w-4 mr-1" />
                            Claim
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Returns Analysis</CardTitle>
                  <CardDescription>Cumulative returns over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={[
                      { month: 'Jan', returns: 5.2, cumulative: 5.2 },
                      { month: 'Feb', returns: 3.8, cumulative: 9.0 },
                      { month: 'Mar', returns: 7.1, cumulative: 16.1 },
                      { month: 'Apr', returns: 4.5, cumulative: 20.6 },
                      { month: 'May', returns: 8.3, cumulative: 28.9 },
                      { month: 'Jun', returns: 6.2, cumulative: 35.1 },
                      { month: 'Jul', returns: 5.4, cumulative: 40.5 },
                      { month: 'Aug', returns: 5.5, cumulative: 46.0 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="returns" fill="#3B82F6" name="Monthly Returns %" />
                      <Line type="monotone" dataKey="cumulative" stroke="#10B981" name="Cumulative %" strokeWidth={2} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Metrics</CardTitle>
                  <CardDescription>Portfolio risk analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Portfolio Risk Level</span>
                      <Badge variant="outline" className="text-yellow-600">
                        {riskMetrics.portfolioRisk}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Risk Score</span>
                      <div className="flex items-center gap-2">
                        <Progress value={riskMetrics.riskScore} className="w-24 h-2" />
                        <span className="font-semibold">{riskMetrics.riskScore}/100</span>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600 dark:text-gray-400">Volatility</div>
                        <div className="font-semibold">{riskMetrics.volatility}</div>
                      </div>
                      <div>
                        <div className="text-gray-600 dark:text-gray-400">Sharpe Ratio</div>
                        <div className="font-semibold">{riskMetrics.sharpeRatio}</div>
                      </div>
                      <div>
                        <div className="text-gray-600 dark:text-gray-400">Max Drawdown</div>
                        <div className="font-semibold text-red-600">{riskMetrics.maxDrawdown}</div>
                      </div>
                      <div>
                        <div className="text-gray-600 dark:text-gray-400">Value at Risk</div>
                        <div className="font-semibold">{riskMetrics.valueAtRisk}</div>
                      </div>
                      <div>
                        <div className="text-gray-600 dark:text-gray-400">Beta</div>
                        <div className="font-semibold">{riskMetrics.betaCoefficient}</div>
                      </div>
                      <div>
                        <div className="text-gray-600 dark:text-gray-400">Correlation</div>
                        <div className="font-semibold">{riskMetrics.correlationIndex}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>Recent investment transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {recentTransactions.map((tx) => (
                      <div key={tx.id} className="p-3 rounded-lg border bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${
                              tx.type === 'Deposit' ? 'bg-green-100 text-green-600' :
                              tx.type === 'Withdraw' ? 'bg-red-100 text-red-600' :
                              tx.type === 'Swap' ? 'bg-blue-100 text-blue-600' :
                              tx.type === 'Stake' ? 'bg-purple-100 text-purple-600' :
                              tx.type === 'Harvest' ? 'bg-yellow-100 text-yellow-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {tx.type === 'Deposit' && <ArrowDownRight className="h-4 w-4" />}
                              {tx.type === 'Withdraw' && <ArrowUpRight className="h-4 w-4" />}
                              {tx.type === 'Swap' && <RefreshCw className="h-4 w-4" />}
                              {tx.type === 'Stake' && <Lock className="h-4 w-4" />}
                              {tx.type === 'Harvest' && <Gem className="h-4 w-4" />}
                              {tx.type === 'Claim' && <Gift className="h-4 w-4" />}
                            </div>
                            <div>
                              <div className="font-semibold">{tx.type}</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {tx.from} → {tx.to}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{tx.amount} {tx.asset}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{tx.value}</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{tx.time}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getStatusColor(tx.status)}>
                              {tx.status}
                            </Badge>
                            <Button variant="ghost" size="sm" className="h-7 px-2">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              {tx.hash}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Opportunities Tab */}
          <TabsContent value="opportunities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>High-Yield Opportunities</CardTitle>
                <CardDescription>Discover new investment opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {yieldOpportunities.map((opp, index) => (
                    <div key={index} className="p-4 rounded-lg border bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-lg">{opp.protocol}</h3>
                        <Badge variant="outline" className={getRiskColor(opp.risk)}>
                          {opp.risk} Risk
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">APY</span>
                          <span className="font-bold text-green-600 text-xl">{opp.apy}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">TVL</span>
                          <span className="font-semibold">{opp.tvl}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Min Investment</span>
                          <span>{opp.minInvestment}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Lock Period</span>
                          <span>{opp.lockPeriod}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        {opp.audited && (
                          <Badge variant="outline" className="text-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Audited
                          </Badge>
                        )}
                        {opp.insurance && (
                          <Badge variant="outline" className="text-blue-600">
                            <Shield className="h-3 w-3 mr-1" />
                            Insured
                          </Badge>
                        )}
                      </div>

                      <Button className="w-full">
                        <Rocket className="h-4 w-4 mr-2" />
                        Invest Now
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Price Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Price Alerts</CardTitle>
                <CardDescription>Set up notifications for price movements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {priceAlerts.map((alert, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center gap-3">
                        <Switch checked={alert.active} />
                        <div>
                          <span className="font-semibold">{alert.asset}</span>
                          <span className="text-gray-600 dark:text-gray-400 mx-2">
                            {alert.condition}
                          </span>
                          <span className="font-semibold">{alert.price}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Alert
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Portfolio Breakdown */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Portfolio Analytics</CardTitle>
                  <CardDescription>Deep dive into portfolio metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" data={[
                      { name: 'Staking', value: 43.4, fill: '#3B82F6' },
                      { name: 'Liquidity', value: 30.8, fill: '#10B981' },
                      { name: 'Yield Farm', value: 16.0, fill: '#8B5CF6' },
                      { name: 'NFTs', value: 9.8, fill: '#F59E0B' }
                    ]}>
                      <RadialBar dataKey="value" />
                      <Legend />
                      <Tooltip />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Statistics</CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Win Rate</span>
                      <span className="font-bold text-green-600">87.3%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Avg Hold Time</span>
                      <span className="font-bold">142 days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Best Performer</span>
                      <span className="font-bold">NFT Collection</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Total Transactions</span>
                      <span className="font-bold">284</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Realized P&L</span>
                      <span className="font-bold text-green-600">+$234,567</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Unrealized P&L</span>
                      <span className="font-bold text-green-600">+$662,956</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1">
              <Circle className="h-2 w-2 mr-2 fill-green-500 text-green-500 animate-pulse" />
              Live Data
            </Badge>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Last updated: Just now
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Alerts
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <HelpCircle className="h-4 w-4 mr-2" />
              Help
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentTracking;