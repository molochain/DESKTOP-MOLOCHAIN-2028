import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Globe,
  Activity,
  TrendingUp,
  Link,
  Zap,
  DollarSign,
  Users,
  BarChart3,
  Network,
  Server,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Hash,
  Cpu,
  HardDrive,
  Shield,
  GitBranch,
  Layers,
  Database,
  Award,
  ChevronRight,
  Info,
  RefreshCw,
  Signal
} from "lucide-react";
import { useState, useEffect } from "react";
import { Line, Bar, Doughnut, Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChainStats {
  name: string;
  symbol: string;
  chainId: number;
  blockHeight: number;
  blockTime: number;
  tps: number;
  validators: number;
  tvl: number;
  gasPrice: string;
  marketCap: number;
  volume24h: number;
  transactions24h: number;
  activeAddresses: number;
  status: 'online' | 'syncing' | 'offline';
  bridgedTokens: number;
  bridgedValue: number;
}

interface BridgeFlow {
  from: string;
  to: string;
  volume: number;
  transactions: number;
  avgTime: string;
  fee: number;
}

const CrossChainAnalytics = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [selectedChain, setSelectedChain] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const chains: ChainStats[] = [
    {
      name: 'Binance Smart Chain',
      symbol: 'BSC',
      chainId: 56,
      blockHeight: 34892374,
      blockTime: 3,
      tps: 378,
      validators: 21,
      tvl: 4847293000,
      gasPrice: '3 Gwei',
      marketCap: 45928374000,
      volume24h: 892374000,
      transactions24h: 3284729,
      activeAddresses: 892374,
      status: 'online',
      bridgedTokens: 47,
      bridgedValue: 238947000
    },
    {
      name: 'Ethereum',
      symbol: 'ETH',
      chainId: 1,
      blockHeight: 18892374,
      blockTime: 12,
      tps: 15,
      validators: 500000,
      tvl: 28947293000,
      gasPrice: '25 Gwei',
      marketCap: 289473920000,
      volume24h: 12938472000,
      transactions24h: 1293847,
      activeAddresses: 523847,
      status: 'online',
      bridgedTokens: 89,
      bridgedValue: 892374000
    },
    {
      name: 'Polygon',
      symbol: 'MATIC',
      chainId: 137,
      blockHeight: 50928374,
      blockTime: 2,
      tps: 429,
      validators: 100,
      tvl: 1928374000,
      gasPrice: '30 Gwei',
      marketCap: 8928374000,
      volume24h: 234892000,
      transactions24h: 5928374,
      activeAddresses: 392847,
      status: 'online',
      bridgedTokens: 63,
      bridgedValue: 128493000
    },
    {
      name: 'Avalanche',
      symbol: 'AVAX',
      chainId: 43114,
      blockHeight: 38294729,
      blockTime: 2,
      tps: 4500,
      validators: 1200,
      tvl: 2384729000,
      gasPrice: '25 nAVAX',
      marketCap: 12847293000,
      volume24h: 384729000,
      transactions24h: 2384729,
      activeAddresses: 234892,
      status: 'online',
      bridgedTokens: 52,
      bridgedValue: 92384000
    },
    {
      name: 'Arbitrum',
      symbol: 'ARB',
      chainId: 42161,
      blockHeight: 150928374,
      blockTime: 1,
      tps: 40000,
      validators: 0,
      tvl: 3928374000,
      gasPrice: '0.1 Gwei',
      marketCap: 1928374000,
      volume24h: 523847000,
      transactions24h: 8392847,
      activeAddresses: 483927,
      status: 'syncing',
      bridgedTokens: 78,
      bridgedValue: 328947000
    }
  ];

  const bridgeFlows: BridgeFlow[] = [
    { from: 'BSC', to: 'Ethereum', volume: 23847293, transactions: 1284, avgTime: '10 min', fee: 0.3 },
    { from: 'Ethereum', to: 'BSC', volume: 18293847, transactions: 982, avgTime: '10 min', fee: 0.3 },
    { from: 'BSC', to: 'Polygon', volume: 12384729, transactions: 2384, avgTime: '5 min', fee: 0.1 },
    { from: 'Polygon', to: 'BSC', volume: 9283749, transactions: 1893, avgTime: '5 min', fee: 0.1 },
    { from: 'Ethereum', to: 'Arbitrum', volume: 38947293, transactions: 3284, avgTime: '7 min', fee: 0.15 },
    { from: 'Arbitrum', to: 'Ethereum', volume: 28374928, transactions: 2893, avgTime: '7 min', fee: 0.15 }
  ];

  // Calculate totals
  const totalTVL = chains.reduce((sum, chain) => sum + chain.tvl, 0);
  const totalTransactions = chains.reduce((sum, chain) => sum + chain.transactions24h, 0);
  const totalVolume = chains.reduce((sum, chain) => sum + chain.volume24h, 0);
  const totalActiveAddresses = chains.reduce((sum, chain) => sum + chain.activeAddresses, 0);

  // Chart data
  const tpsComparisonData = {
    labels: chains.map(c => c.symbol),
    datasets: [
      {
        label: 'Transactions Per Second',
        data: chains.map(c => c.tps),
        backgroundColor: [
          'rgba(250, 204, 21, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(59, 130, 246, 0.8)'
        ],
        borderWidth: 0
      }
    ]
  };

  const tvlDistributionData = {
    labels: chains.map(c => c.name),
    datasets: [
      {
        data: chains.map(c => c.tvl),
        backgroundColor: [
          'rgba(250, 204, 21, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(59, 130, 246, 0.8)'
        ],
        borderWidth: 0
      }
    ]
  };

  const networkActivityData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
    datasets: chains.map((chain, idx) => ({
      label: chain.symbol,
      data: [
        Math.random() * 100000,
        Math.random() * 100000,
        Math.random() * 100000,
        Math.random() * 100000,
        Math.random() * 100000,
        Math.random() * 100000,
        Math.random() * 100000
      ],
      borderColor: [
        'rgb(250, 204, 21)',
        'rgb(139, 92, 246)',
        'rgb(168, 85, 247)',
        'rgb(239, 68, 68)',
        'rgb(59, 130, 246)'
      ][idx],
      backgroundColor: [
        'rgba(250, 204, 21, 0.1)',
        'rgba(139, 92, 246, 0.1)',
        'rgba(168, 85, 247, 0.1)',
        'rgba(239, 68, 68, 0.1)',
        'rgba(59, 130, 246, 0.1)'
      ][idx],
      tension: 0.4,
      fill: true
    }))
  };

  const performanceRadarData = {
    labels: ['TPS', 'Block Time', 'Gas Efficiency', 'Decentralization', 'TVL', 'Activity'],
    datasets: [
      {
        label: 'BSC',
        data: [75, 90, 85, 30, 60, 80],
        borderColor: 'rgb(250, 204, 21)',
        backgroundColor: 'rgba(250, 204, 21, 0.2)',
      },
      {
        label: 'Ethereum',
        data: [20, 40, 50, 100, 100, 70],
        borderColor: 'rgb(139, 92, 246)',
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
      },
      {
        label: 'Polygon',
        data: [80, 95, 90, 40, 40, 85],
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.2)',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)'
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          padding: 15,
          font: {
            size: 12
          }
        }
      }
    }
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20
        }
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'online': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'syncing': return <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'offline': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        // Simulate data refresh
        if (import.meta.env.DEV) {
          console.log('Refreshing cross-chain data...');
        }
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

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
              <Network className="w-3 h-3 mr-1" /> Cross-Chain Analytics
            </Badge>
            <h1 className="text-4xl font-bold mb-4">Multi-Chain Network Analytics</h1>
            <p className="text-muted-foreground text-lg">
              Real-time monitoring and analytics across multiple blockchain networks. 
              Track performance, bridge flows, and cross-chain activity.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Global Stats */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total TVL</p>
                  <p className="text-2xl font-bold">${(totalTVL / 1000000000).toFixed(1)}B</p>
                  <p className="text-xs text-green-500">
                    <ArrowUp className="w-3 h-3 inline mr-1" />
                    +18.5% (24h)
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Chains</p>
                  <p className="text-2xl font-bold">{chains.filter(c => c.status === 'online').length}/{chains.length}</p>
                  <p className="text-xs text-green-500">All systems operational</p>
                </div>
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <Signal className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">24h Transactions</p>
                  <p className="text-2xl font-bold">{(totalTransactions / 1000000).toFixed(1)}M</p>
                  <p className="text-xs text-yellow-500">
                    <ArrowUp className="w-3 h-3 inline mr-1" />
                    +5.2%
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Bridge Volume</p>
                  <p className="text-2xl font-bold">$152M</p>
                  <p className="text-xs text-muted-foreground">24h cross-chain</p>
                </div>
                <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                  <GitBranch className="w-6 h-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            {['1h', '24h', '7d', '30d'].map((period) => (
              <Button
                key={period}
                size="sm"
                variant={selectedTimeframe === period ? 'default' : 'outline'}
                onClick={() => setSelectedTimeframe(period)}
              >
                {period}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedChain} onValueChange={setSelectedChain}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Chains</SelectItem>
                {chains.map(chain => (
                  <SelectItem key={chain.chainId} value={chain.symbol}>{chain.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant={autoRefresh ? 'default' : 'outline'}
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto Refresh
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="bridges">Bridge Flows</TabsTrigger>
            <TabsTrigger value="chains">Chain Details</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Network Activity Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Network Activity</CardTitle>
                  <CardDescription>
                    Transaction volume across chains over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Line data={networkActivityData} options={chartOptions} />
                  </div>
                </CardContent>
              </Card>

              {/* TVL Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>TVL Distribution</CardTitle>
                  <CardDescription>
                    Total value locked across different chains
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Doughnut data={tvlDistributionData} options={doughnutOptions} />
                  </div>
                </CardContent>
              </Card>

              {/* TPS Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle>TPS Comparison</CardTitle>
                  <CardDescription>
                    Transactions per second capability
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Bar data={tpsComparisonData} options={chartOptions} />
                  </div>
                </CardContent>
              </Card>

              {/* Performance Radar */}
              <Card>
                <CardHeader>
                  <CardTitle>Chain Performance Metrics</CardTitle>
                  <CardDescription>
                    Comparative analysis of key performance indicators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Radar data={performanceRadarData} options={radarOptions} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="mt-6">
            <div className="grid gap-6">
              {chains.map((chain) => (
                <motion.div
                  key={chain.chainId}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold">{chain.name}</h3>
                            <Badge variant="outline">Chain ID: {chain.chainId}</Badge>
                            {getStatusIcon(chain.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Block #{chain.blockHeight.toLocaleString()} • {chain.blockTime}s blocks
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{chain.tps}</p>
                          <p className="text-xs text-muted-foreground">TPS</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Validators</p>
                          <p className="font-medium">{chain.validators.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Gas Price</p>
                          <p className="font-medium">{chain.gasPrice}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">TVL</p>
                          <p className="font-medium">${(chain.tvl / 1000000000).toFixed(2)}B</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">24h Volume</p>
                          <p className="font-medium">${(chain.volume24h / 1000000).toFixed(0)}M</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Active Addresses</p>
                          <p className="font-medium">{(chain.activeAddresses / 1000).toFixed(0)}K</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Bridged Tokens</p>
                          <p className="font-medium">{chain.bridgedTokens}</p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Network Load</span>
                          <span>{Math.floor(Math.random() * 40 + 60)}%</span>
                        </div>
                        <Progress value={Math.floor(Math.random() * 40 + 60)} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Bridge Flows Tab */}
          <TabsContent value="bridges" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Active Bridge Routes</CardTitle>
                  <CardDescription>
                    Cross-chain token transfers and volume
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bridgeFlows.map((flow, idx) => (
                      <div key={idx} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{flow.from}</Badge>
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            <Badge variant="outline">{flow.to}</Badge>
                          </div>
                          <span className="text-sm font-medium">
                            ${(flow.volume / 1000000).toFixed(1)}M
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <p className="text-muted-foreground">Transactions</p>
                            <p className="font-medium">{flow.transactions.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Avg Time</p>
                            <p className="font-medium">{flow.avgTime}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Fee</p>
                            <p className="font-medium">{flow.fee}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Bridge Statistics</CardTitle>
                  <CardDescription>
                    Cross-chain interoperability metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Total Bridge Volume</span>
                        <span className="text-2xl font-bold">$152M</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Last 24 hours</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-muted rounded">
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="w-4 h-4 text-yellow-500" />
                          <span className="text-xs text-muted-foreground">Fastest Route</span>
                        </div>
                        <p className="font-medium">BSC → Polygon</p>
                        <p className="text-xs text-muted-foreground">~5 min avg</p>
                      </div>
                      <div className="p-3 bg-muted rounded">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span className="text-xs text-muted-foreground">Most Active</span>
                        </div>
                        <p className="font-medium">ETH ↔ ARB</p>
                        <p className="text-xs text-muted-foreground">3,284 txns</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-3">Supported Assets</h4>
                      <div className="flex flex-wrap gap-2">
                        {['MOLOCHAIN', 'USDT', 'USDC', 'ETH', 'BNB', 'MATIC', 'AVAX'].map(token => (
                          <Badge key={token} variant="secondary">
                            {token}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Chain Details Tab */}
          <TabsContent value="chains" className="mt-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Chain Information</CardTitle>
                  <CardDescription>
                    Technical specifications and network parameters
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Chain</th>
                          <th className="text-left p-2">Status</th>
                          <th className="text-right p-2">Block Height</th>
                          <th className="text-right p-2">TPS</th>
                          <th className="text-right p-2">Validators</th>
                          <th className="text-right p-2">Gas Price</th>
                          <th className="text-right p-2">Market Cap</th>
                        </tr>
                      </thead>
                      <tbody>
                        {chains.map((chain) => (
                          <tr key={chain.chainId} className="border-b">
                            <td className="p-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{chain.symbol}</Badge>
                                <span className="font-medium">{chain.name}</span>
                              </div>
                            </td>
                            <td className="p-2">
                              <div className="flex items-center gap-1">
                                {getStatusIcon(chain.status)}
                                <span className="text-sm capitalize">{chain.status}</span>
                              </div>
                            </td>
                            <td className="text-right p-2 font-mono text-sm">
                              {chain.blockHeight.toLocaleString()}
                            </td>
                            <td className="text-right p-2">
                              {chain.tps.toLocaleString()}
                            </td>
                            <td className="text-right p-2">
                              {chain.validators.toLocaleString()}
                            </td>
                            <td className="text-right p-2 text-sm">
                              {chain.gasPrice}
                            </td>
                            <td className="text-right p-2">
                              ${(chain.marketCap / 1000000000).toFixed(1)}B
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Info Box */}
              <Card className="bg-gradient-to-r from-blue-500/5 to-purple-500/5 border-blue-500/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm mb-1">Cross-Chain Infrastructure</p>
                      <p className="text-xs text-muted-foreground">
                        MOLOCHAIN operates across multiple blockchain networks to ensure maximum 
                        interoperability and accessibility. Our cross-chain bridges enable seamless 
                        token transfers with minimal fees and optimized routing.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CrossChainAnalytics;