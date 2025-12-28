import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap,
  ComposedChart
} from 'recharts';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Blocks,
  Network,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Globe,
  Shield,
  Zap,
  Target,
  Award,
  BarChart3,
  PieChart as PieChartIcon,
  Wallet,
  Link,
  Cpu,
  Database,
  Server,
  Clock,
  AlertTriangle,
  CheckCircle,
  Info,
  Hash,
  GitBranch,
  Layers,
  Package,
  Rocket,
  Coins,
  CreditCard,
  RefreshCw,
  Download,
  Share2,
  Settings,
  Filter,
  Search,
  Eye,
  EyeOff,
  Bell,
  BellOff,
  Lock,
  Unlock,
  UserCheck,
  UserX,
  FileText,
  Code,
  Terminal,
  Briefcase,
  Building,
  Globe2,
  Map,
  Navigation,
  Truck,
  Ship,
  Plane,
  Train,
  Package2,
  Box,
  Archive,
  Folder,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Copy,
  Check,
  X,
  Plus,
  Minus,
  Star,
  Heart,
  MessageSquare,
  Send,
  Inbox,
  Mail,
  Calendar,
  Clock3,
  Timer,
  Gauge,
  Flame,
  Droplets,
  Wind,
  Cloud,
  Sun,
  Moon,
  Sparkles,
  Gem,
  Trophy,
  Flag,
  MapPin,
  Compass,
  Anchor,
  Key,
  Fingerprint,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  GitCommit,
  GitMerge,
  GitPullRequest,
  Github,
  Gitlab,
  Command,
  Option,
  Crosshair,
  Maximize,
  Minimize,
  Move,
  Grid,
  List,
  LayoutGrid,
  LayoutList,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Octagon,
  Pentagon
} from 'lucide-react';

const BlockchainAnalyticsDashboard = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedNetwork, setSelectedNetwork] = useState('all');
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);

  // Real-time blockchain metrics
  const blockchainMetrics = {
    totalTransactions: '12.8M',
    transactionVolume: '$4.2B',
    activeWallets: '287.4K',
    averageBlockTime: '3.2s',
    gasPrice: '12.5 Gwei',
    networkHashrate: '892 TH/s',
    totalValueLocked: '$1.87B',
    marketCap: '$524M',
    circulatingSupply: '450M MOLO',
    stakingRatio: '67.8%',
    validatorCount: '1,284',
    averageTPS: '4,250'
  };

  // Network performance data
  const networkPerformance = [
    { time: '00:00', tps: 3800, latency: 45, success: 99.8 },
    { time: '04:00', tps: 3200, latency: 52, success: 99.7 },
    { time: '08:00', tps: 4500, latency: 38, success: 99.9 },
    { time: '12:00', tps: 5200, latency: 35, success: 99.95 },
    { time: '16:00', tps: 4800, latency: 40, success: 99.85 },
    { time: '20:00', tps: 4100, latency: 43, success: 99.8 },
    { time: '24:00', tps: 3900, latency: 46, success: 99.75 }
  ];

  // Transaction distribution
  const transactionTypes = [
    { name: 'Smart Contract Calls', value: 35, color: '#3B82F6' },
    { name: 'Token Transfers', value: 28, color: '#10B981' },
    { name: 'DeFi Operations', value: 22, color: '#8B5CF6' },
    { name: 'NFT Trading', value: 10, color: '#F59E0B' },
    { name: 'Governance', value: 5, color: '#EF4444' }
  ];

  // Chain comparison
  const chainComparison = [
    { chain: 'MOLOCHAIN', tps: 4250, fees: 0.001, finality: 3, score: 95 },
    { chain: 'Ethereum', tps: 15, fees: 15, finality: 900, score: 65 },
    { chain: 'Polygon', tps: 7000, fees: 0.01, finality: 2, score: 85 },
    { chain: 'BSC', tps: 300, fees: 0.5, finality: 3, score: 75 },
    { chain: 'Solana', tps: 65000, fees: 0.00025, finality: 0.4, score: 88 },
    { chain: 'Avalanche', tps: 4500, fees: 1, finality: 1, score: 82 }
  ];

  // DeFi metrics
  const defiMetrics = [
    { protocol: 'MOLO Swap', tvl: '$487M', apy: '12.8%', users: '45.2K' },
    { protocol: 'MOLO Lend', tvl: '$325M', apy: '8.5%', users: '28.7K' },
    { protocol: 'MOLO Stake', tvl: '$612M', apy: '18.2%', users: '89.3K' },
    { protocol: 'MOLO Bridge', tvl: '$198M', apy: '5.2%', users: '15.6K' },
    { protocol: 'MOLO Yield', tvl: '$245M', apy: '22.4%', users: '32.1K' }
  ];

  // Investment flow analysis
  const investmentFlow = [
    { source: 'Institutional', target: 'Staking', value: 245 },
    { source: 'Institutional', target: 'Liquidity', value: 189 },
    { source: 'Retail', target: 'Staking', value: 156 },
    { source: 'Retail', target: 'Trading', value: 234 },
    { source: 'Retail', target: 'NFTs', value: 78 },
    { source: 'DeFi Protocols', target: 'Liquidity', value: 312 },
    { source: 'DeFi Protocols', target: 'Lending', value: 198 }
  ];

  // Whale activity tracker
  const whaleActivity = [
    {
      address: '0x1234...5678',
      type: 'Buy',
      amount: '2.5M MOLO',
      value: '$3.2M',
      time: '2 mins ago',
      impact: '+2.8%'
    },
    {
      address: '0xabcd...efgh',
      type: 'Stake',
      amount: '1.8M MOLO',
      value: '$2.3M',
      time: '15 mins ago',
      impact: 'Neutral'
    },
    {
      address: '0x9876...5432',
      type: 'Transfer',
      amount: '3.1M MOLO',
      value: '$4.0M',
      time: '1 hour ago',
      impact: '-1.2%'
    },
    {
      address: '0xfedc...ba98',
      type: 'Provide Liquidity',
      amount: '4.2M MOLO',
      value: '$5.4M',
      time: '3 hours ago',
      impact: '+3.5%'
    }
  ];

  // Network health indicators
  const networkHealth = {
    consensus: { status: 'healthy', value: 99.98 },
    mempool: { status: 'normal', value: ' 284 pending' },
    validators: { status: 'healthy', value: '1,284 active' },
    propagation: { status: 'optimal', value: '45ms avg' },
    security: { status: 'secure', value: 'No threats' },
    uptime: { status: 'excellent', value: '99.99%' }
  };

  // Cross-chain bridge statistics
  const bridgeStats = [
    { chain: 'Ethereum', volume: '$124M', transactions: '8.2K', avgTime: '15 min' },
    { chain: 'Polygon', volume: '$87M', transactions: '12.5K', avgTime: '2 min' },
    { chain: 'BSC', volume: '$65M', transactions: '9.8K', avgTime: '3 min' },
    { chain: 'Arbitrum', volume: '$52M', transactions: '6.3K', avgTime: '5 min' },
    { chain: 'Optimism', volume: '$43M', transactions: '5.1K', avgTime: '4 min' },
    { chain: 'Avalanche', volume: '$38M', transactions: '4.7K', avgTime: '2 min' }
  ];

  // Smart contract analytics
  const smartContractMetrics = {
    totalContracts: '12,847',
    verifiedContracts: '10,234',
    dailyDeployments: '147',
    totalInteractions: '45.2M',
    averageGasUsed: '125,000',
    popularContracts: [
      { name: 'MOLO Token', calls: '2.8M', gas: '21,000' },
      { name: 'Staking Pool', calls: '1.5M', gas: '85,000' },
      { name: 'DEX Router', calls: '987K', gas: '150,000' },
      { name: 'NFT Marketplace', calls: '654K', gas: '200,000' },
      { name: 'Governance', calls: '234K', gas: '95,000' }
    ]
  };

  // Gas optimization trends
  const gasOptimization = [
    { month: 'Jan', avgGas: 145000, optimized: 95000 },
    { month: 'Feb', avgGas: 142000, optimized: 88000 },
    { month: 'Mar', avgGas: 138000, optimized: 82000 },
    { month: 'Apr', avgGas: 135000, optimized: 78000 },
    { month: 'May', avgGas: 130000, optimized: 72000 },
    { month: 'Jun', avgGas: 125000, optimized: 68000 }
  ];

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        // Simulate data refresh
        if (import.meta.env.DEV) {
          console.log('Refreshing blockchain analytics data...');
        }
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'secure':
      case 'optimal':
      case 'excellent':
        return 'text-green-500';
      case 'normal':
        return 'text-blue-500';
      case 'warning':
        return 'text-yellow-500';
      case 'critical':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const formatNumber = (num: string | number) => {
    if (typeof num === 'string') return num;
    return new Intl.NumberFormat('en-US', { 
      notation: 'compact', 
      maximumFractionDigits: 2 
    }).format(num);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Blockchain Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Real-time insights into MOLOCHAIN network performance and investment metrics
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
                id="auto-refresh"
              />
              <Label htmlFor="auto-refresh">Auto-refresh</Label>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Now
            </Button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                Total Value Locked
                <Lock className="h-5 w-5 opacity-80" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{blockchainMetrics.totalValueLocked}</div>
              <div className="flex items-center mt-2 text-blue-100">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span className="text-sm">+12.8% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                Transaction Volume
                <Activity className="h-5 w-5 opacity-80" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{blockchainMetrics.transactionVolume}</div>
              <div className="flex items-center mt-2 text-green-100">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span className="text-sm">+24.5% from last week</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                Active Wallets
                <Wallet className="h-5 w-5 opacity-80" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{blockchainMetrics.activeWallets}</div>
              <div className="flex items-center mt-2 text-purple-100">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span className="text-sm">+8,234 new today</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                Network TPS
                <Zap className="h-5 w-5 opacity-80" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{blockchainMetrics.averageTPS}</div>
              <div className="flex items-center mt-2 text-orange-100">
                <Activity className="h-4 w-4 mr-1" />
                <span className="text-sm">Peak: 8,450 TPS</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Tabs */}
        <Tabs defaultValue="network" className="space-y-4">
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="network">Network</TabsTrigger>
            <TabsTrigger value="defi">DeFi</TabsTrigger>
            <TabsTrigger value="investment">Investment</TabsTrigger>
            <TabsTrigger value="contracts">Smart Contracts</TabsTrigger>
            <TabsTrigger value="bridge">Cross-Chain</TabsTrigger>
            <TabsTrigger value="whales">Whale Tracking</TabsTrigger>
          </TabsList>

          {/* Network Performance Tab */}
          <TabsContent value="network" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Network Performance</CardTitle>
                  <CardDescription>Transactions per second and latency metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={networkPerformance}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="time" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="tps" fill="#3B82F6" name="TPS" />
                      <Line yAxisId="right" type="monotone" dataKey="latency" stroke="#EF4444" name="Latency (ms)" strokeWidth={2} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Transaction Distribution</CardTitle>
                  <CardDescription>Breakdown by transaction type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={transactionTypes}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {transactionTypes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Network Health Status */}
            <Card>
              <CardHeader>
                <CardTitle>Network Health Status</CardTitle>
                <CardDescription>Real-time health indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {Object.entries(networkHealth).map(([key, data]) => (
                    <div key={key} className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="text-sm text-gray-600 dark:text-gray-400 capitalize mb-2">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div className={`text-lg font-semibold ${getStatusColor(data.status)}`}>
                        {data.value}
                      </div>
                      <Badge className="mt-2" variant={data.status === 'healthy' ? 'default' : 'secondary'}>
                        {data.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Chain Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Blockchain Performance Comparison</CardTitle>
                <CardDescription>MOLOCHAIN vs other major networks</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={chainComparison}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="chain" />
                    <PolarRadiusAxis />
                    <Radar name="Performance Score" dataKey="score" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DeFi Analytics Tab */}
          <TabsContent value="defi" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>DeFi Protocol Performance</CardTitle>
                  <CardDescription>Total value locked and APY across protocols</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {defiMetrics.map((protocol, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <div className="flex-1">
                          <div className="font-semibold">{protocol.protocol}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {protocol.users} users
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">{protocol.tvl}</div>
                          <Badge variant="outline" className="text-green-600">
                            APY: {protocol.apy}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Gas Optimization Trends</CardTitle>
                  <CardDescription>Average vs optimized gas usage over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={gasOptimization}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="avgGas" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} name="Average Gas" />
                      <Area type="monotone" dataKey="optimized" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Optimized Gas" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Liquidity Pools */}
            <Card>
              <CardHeader>
                <CardTitle>Top Liquidity Pools</CardTitle>
                <CardDescription>Most active trading pairs and liquidity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { pair: 'MOLO/USDT', liquidity: '$124M', volume24h: '$45.2M', apy: '18.5%' },
                    { pair: 'MOLO/ETH', liquidity: '$87M', volume24h: '$32.1M', apy: '15.2%' },
                    { pair: 'MOLO/BTC', liquidity: '$65M', volume24h: '$28.7M', apy: '12.8%' },
                    { pair: 'MOLO/BNB', liquidity: '$43M', volume24h: '$18.9M', apy: '10.5%' }
                  ].map((pool, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center gap-3">
                        <Droplets className="h-5 w-5 text-blue-500" />
                        <div>
                          <div className="font-semibold">{pool.pair}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            24h Volume: {pool.volume24h}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{pool.liquidity}</div>
                        <Badge variant="outline" className="text-green-600">
                          APY: {pool.apy}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Investment Flow Tab */}
          <TabsContent value="investment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Investment Flow Analysis</CardTitle>
                <CardDescription>Capital movement across different investment categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950">
                    <div className="text-3xl font-bold text-blue-600">$892M</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Inflow (24h)</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950">
                    <div className="text-3xl font-bold text-green-600">$567M</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Outflow (24h)</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-950">
                    <div className="text-3xl font-bold text-purple-600">+$325M</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Net Flow (24h)</div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={[
                    { category: 'Staking', inflow: 401, outflow: 156, net: 245 },
                    { category: 'Liquidity', inflow: 501, outflow: 189, net: 312 },
                    { category: 'Trading', inflow: 234, outflow: 234, net: 0 },
                    { category: 'NFTs', inflow: 178, outflow: 100, net: 78 },
                    { category: 'Lending', inflow: 298, outflow: 100, net: 198 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="inflow" fill="#10B981" name="Inflow ($M)" />
                    <Bar dataKey="outflow" fill="#EF4444" name="Outflow ($M)" />
                    <Bar dataKey="net" fill="#3B82F6" name="Net Flow ($M)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* ROI Tracker */}
            <Card>
              <CardHeader>
                <CardTitle>Investment ROI Tracker</CardTitle>
                <CardDescription>Performance of different investment strategies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { strategy: 'Long-term Staking', roi: '+145%', period: '1 Year', risk: 'Low' },
                    { strategy: 'Liquidity Providing', roi: '+87%', period: '6 Months', risk: 'Medium' },
                    { strategy: 'Yield Farming', roi: '+234%', period: '3 Months', risk: 'High' },
                    { strategy: 'NFT Trading', roi: '+67%', period: '1 Month', risk: 'Very High' }
                  ].map((strategy, index) => (
                    <div key={index} className="p-4 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                      <div className="font-semibold mb-2">{strategy.strategy}</div>
                      <div className="text-2xl font-bold text-green-600 mb-1">{strategy.roi}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <div>Period: {strategy.period}</div>
                        <Badge variant={strategy.risk === 'Low' ? 'default' : strategy.risk === 'Medium' ? 'secondary' : 'destructive'} className="mt-2">
                          Risk: {strategy.risk}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Smart Contracts Tab */}
          <TabsContent value="contracts" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Popular Smart Contracts</CardTitle>
                  <CardDescription>Most interacted contracts on the network</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {smartContractMetrics.popularContracts.map((contract, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-center gap-3">
                          <Code className="h-5 w-5 text-purple-500" />
                          <div>
                            <div className="font-semibold">{contract.name}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Avg Gas: {contract.gas}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{contract.calls} calls</div>
                          <Badge variant="outline">Active</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contract Statistics</CardTitle>
                  <CardDescription>Overall smart contract metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Total Contracts</span>
                      <span className="font-bold">{smartContractMetrics.totalContracts}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Verified</span>
                      <span className="font-bold">{smartContractMetrics.verifiedContracts}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Daily Deployments</span>
                      <span className="font-bold">{smartContractMetrics.dailyDeployments}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Total Interactions</span>
                      <span className="font-bold">{smartContractMetrics.totalInteractions}</span>
                    </div>
                    <Separator />
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">79.7%</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Verification Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Cross-Chain Bridge Tab */}
          <TabsContent value="bridge" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cross-Chain Bridge Statistics</CardTitle>
                <CardDescription>Volume and transactions across different chains</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Chain</th>
                        <th className="text-right p-2">24h Volume</th>
                        <th className="text-right p-2">Transactions</th>
                        <th className="text-right p-2">Avg Time</th>
                        <th className="text-right p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bridgeStats.map((bridge, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <Link className="h-4 w-4 text-blue-500" />
                              {bridge.chain}
                            </div>
                          </td>
                          <td className="text-right p-2 font-semibold">{bridge.volume}</td>
                          <td className="text-right p-2">{bridge.transactions}</td>
                          <td className="text-right p-2">{bridge.avgTime}</td>
                          <td className="text-right p-2">
                            <Badge variant="outline" className="text-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Bridge Flow Visualization */}
            <Card>
              <CardHeader>
                <CardTitle>Bridge Flow Visualization</CardTitle>
                <CardDescription>Real-time cross-chain transfer flow</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { from: 'Ethereum', to: 'MOLOCHAIN', amount: '$45.2M', txns: '234' },
                    { from: 'MOLOCHAIN', to: 'Polygon', amount: '$32.1M', txns: '187' },
                    { from: 'BSC', to: 'MOLOCHAIN', amount: '$28.7M', txns: '156' },
                    { from: 'MOLOCHAIN', to: 'Arbitrum', amount: '$24.5M', txns: '143' },
                    { from: 'Avalanche', to: 'MOLOCHAIN', amount: '$19.8M', txns: '98' },
                    { from: 'MOLOCHAIN', to: 'Optimism', amount: '$15.3M', txns: '76' }
                  ].map((flow, index) => (
                    <div key={index} className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold">{flow.from}</span>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-semibold">{flow.to}</span>
                      </div>
                      <div className="text-lg font-bold">{flow.amount}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{flow.txns} transactions</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Whale Tracking Tab */}
          <TabsContent value="whales" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Whale Activity Tracker</CardTitle>
                <CardDescription>Large transactions and their market impact</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {whaleActivity.map((activity, index) => (
                    <div key={index} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            activity.type === 'Buy' ? 'bg-green-100 text-green-600' :
                            activity.type === 'Sell' ? 'bg-red-100 text-red-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {activity.type === 'Buy' ? <TrendingUp className="h-5 w-5" /> :
                             activity.type === 'Sell' ? <TrendingDown className="h-5 w-5" /> :
                             <Activity className="h-5 w-5" />}
                          </div>
                          <div>
                            <div className="font-semibold">{activity.address}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{activity.time}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={activity.type === 'Buy' ? 'default' : activity.type === 'Sell' ? 'destructive' : 'secondary'}>
                            {activity.type}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-semibold">{activity.amount}</span>
                          <span className="text-gray-600 dark:text-gray-400 ml-2">({activity.value})</span>
                        </div>
                        <div className="text-sm">
                          Market Impact: 
                          <span className={`ml-1 font-semibold ${
                            activity.impact.startsWith('+') ? 'text-green-600' :
                            activity.impact.startsWith('-') ? 'text-red-600' :
                            'text-gray-600'
                          }`}>
                            {activity.impact}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Whale Holdings Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Whale Holdings Distribution</CardTitle>
                <CardDescription>Top holders and their percentage of supply</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <Treemap
                    data={[
                      { name: 'Top 10 Holders', size: 15.2, fill: '#3B82F6' },
                      { name: 'Top 11-50', size: 12.8, fill: '#10B981' },
                      { name: 'Top 51-100', size: 8.5, fill: '#8B5CF6' },
                      { name: 'Top 101-500', size: 18.3, fill: '#F59E0B' },
                      { name: 'Others', size: 45.2, fill: '#6B7280' }
                    ]}
                    dataKey="size"
                    aspectRatio={4 / 3}
                    stroke="#fff"
                    fill="#8884d8"
                  />
                </ResponsiveContainer>
                <div className="mt-4 text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Gini Coefficient: <span className="font-semibold">0.68</span> (Moderate concentration)
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Advanced Metrics Toggle */}
        {showAdvancedMetrics && (
          <Card>
            <CardHeader>
              <CardTitle>Advanced Metrics</CardTitle>
              <CardDescription>Deep dive into blockchain performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <Cpu className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold">98.7%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Node Sync Rate</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <Database className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold">42.3 TB</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Chain Size</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <div className="text-2xl font-bold">100%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Security Score</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <Zap className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                  <div className="text-2xl font-bold">0.8s</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Block Finality</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
          >
            {showAdvancedMetrics ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showAdvancedMetrics ? 'Hide' : 'Show'} Advanced Metrics
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share Report
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockchainAnalyticsDashboard;