import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Coins,
  TrendingUp,
  TrendingDown,
  Lock,
  Unlock,
  Users,
  DollarSign,
  Activity,
  PieChart,
  BarChart3,
  LineChart,
  Award,
  Flame,
  Shield,
  Target,
  Clock,
  Calendar,
  ArrowUp,
  ArrowDown,
  Info,
  AlertCircle,
  CheckCircle,
  Wallet,
  Network,
  Zap,
  ChevronRight,
  RefreshCw,
  Hash,
  Globe
} from "lucide-react";
import { useState, useEffect } from "react";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
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
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TokenMetrics {
  price: number;
  priceChange24h: number;
  marketCap: number;
  fullyDilutedValuation: number;
  volume24h: number;
  circulatingSupply: number;
  totalSupply: number;
  maxSupply: number;
  burnedTokens: number;
  stakedTokens: number;
  liquidityLocked: number;
  holders: number;
  transactions24h: number;
}

interface VestingSchedule {
  category: string;
  allocation: number;
  percentage: number;
  released: number;
  locked: number;
  schedule: string;
  nextUnlock: string;
  color: string;
}

const TokenEconomics = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const metrics: TokenMetrics = {
    price: 0.75,
    priceChange24h: 8.5,
    marketCap: 75000000,
    fullyDilutedValuation: 750000000,
    volume24h: 12500000,
    circulatingSupply: 100000000,
    totalSupply: 500000000,
    maxSupply: 1000000000,
    burnedTokens: 25000000,
    stakedTokens: 45000000,
    liquidityLocked: 30000000,
    holders: 125000,
    transactions24h: 45678
  };

  const vestingSchedule: VestingSchedule[] = [
    {
      category: 'Public Sale',
      allocation: 150000000,
      percentage: 15,
      released: 150000000,
      locked: 0,
      schedule: 'Fully Released',
      nextUnlock: 'Completed',
      color: 'rgba(34, 197, 94, 0.8)'
    },
    {
      category: 'Team & Advisors',
      allocation: 200000000,
      percentage: 20,
      released: 50000000,
      locked: 150000000,
      schedule: '2-year vesting with 6-month cliff',
      nextUnlock: 'Mar 2025',
      color: 'rgba(59, 130, 246, 0.8)'
    },
    {
      category: 'Ecosystem Fund',
      allocation: 250000000,
      percentage: 25,
      released: 75000000,
      locked: 175000000,
      schedule: '5-year linear release',
      nextUnlock: 'Monthly',
      color: 'rgba(168, 85, 247, 0.8)'
    },
    {
      category: 'Staking Rewards',
      allocation: 150000000,
      percentage: 15,
      released: 30000000,
      locked: 120000000,
      schedule: '10-year emission schedule',
      nextUnlock: 'Daily',
      color: 'rgba(250, 204, 21, 0.8)'
    },
    {
      category: 'Development',
      allocation: 100000000,
      percentage: 10,
      released: 25000000,
      locked: 75000000,
      schedule: '3-year quarterly release',
      nextUnlock: 'Q1 2025',
      color: 'rgba(239, 68, 68, 0.8)'
    },
    {
      category: 'Partnerships',
      allocation: 100000000,
      percentage: 10,
      released: 20000000,
      locked: 80000000,
      schedule: 'Performance-based release',
      nextUnlock: 'Variable',
      color: 'rgba(14, 165, 233, 0.8)'
    },
    {
      category: 'Reserve',
      allocation: 50000000,
      percentage: 5,
      released: 0,
      locked: 50000000,
      schedule: 'Emergency fund (locked)',
      nextUnlock: 'N/A',
      color: 'rgba(107, 114, 128, 0.8)'
    }
  ];

  // Calculate percentages
  const circulatingPercentage = (metrics.circulatingSupply / metrics.maxSupply) * 100;
  const burnedPercentage = (metrics.burnedTokens / metrics.maxSupply) * 100;
  const stakedPercentage = (metrics.stakedTokens / metrics.circulatingSupply) * 100;
  const lockedPercentage = (metrics.liquidityLocked / metrics.circulatingSupply) * 100;

  // Chart data
  const distributionData = {
    labels: vestingSchedule.map(v => v.category),
    datasets: [
      {
        data: vestingSchedule.map(v => v.allocation),
        backgroundColor: vestingSchedule.map(v => v.color),
        borderWidth: 0
      }
    ]
  };

  const supplyBreakdownData = {
    labels: ['Circulating', 'Locked', 'Burned', 'Not Minted'],
    datasets: [
      {
        data: [
          metrics.circulatingSupply,
          metrics.totalSupply - metrics.circulatingSupply,
          metrics.burnedTokens,
          metrics.maxSupply - metrics.totalSupply - metrics.burnedTokens
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(107, 114, 128, 0.8)'
        ],
        borderWidth: 0
      }
    ]
  };

  const priceHistoryData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Token Price (USD)',
        data: [0.25, 0.28, 0.35, 0.42, 0.48, 0.52, 0.58, 0.65, 0.75, 0.82, 0.88, 0.95],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const emissionScheduleData = {
    labels: ['Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Y6', 'Y7', 'Y8', 'Y9', 'Y10'],
    datasets: [
      {
        label: 'Circulating Supply',
        data: [100, 180, 250, 320, 380, 430, 470, 500, 520, 530],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1
      },
      {
        label: 'Burned Tokens',
        data: [5, 12, 20, 30, 42, 55, 70, 85, 100, 115],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1
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

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        // Simulate data refresh
        if (import.meta.env.DEV) {
          console.log('Refreshing token metrics...');
        }
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-b">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <Badge className="mb-4" variant="outline">
              <Coins className="w-3 h-3 mr-1" /> Token Economics
            </Badge>
            <h1 className="text-4xl font-bold mb-4">MOLOCHAIN Token Economics</h1>
            <p className="text-muted-foreground text-lg">
              Complete tokenomics overview including supply metrics, distribution, 
              vesting schedules, and deflationary mechanisms.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Token Price</p>
                  <p className="text-2xl font-bold">${metrics.price}</p>
                  <p className={`text-xs ${metrics.priceChange24h > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {metrics.priceChange24h > 0 ? <ArrowUp className="w-3 h-3 inline mr-1" /> : <ArrowDown className="w-3 h-3 inline mr-1" />}
                    {Math.abs(metrics.priceChange24h)}% (24h)
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Market Cap</p>
                  <p className="text-2xl font-bold">${(metrics.marketCap / 1000000).toFixed(0)}M</p>
                  <p className="text-xs text-muted-foreground">
                    Rank #247
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Holders</p>
                  <p className="text-2xl font-bold">{(metrics.holders / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-green-500">
                    <ArrowUp className="w-3 h-3 inline mr-1" />
                    +2.5K this week
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">24h Volume</p>
                  <p className="text-2xl font-bold">${(metrics.volume24h / 1000000).toFixed(1)}M</p>
                  <p className="text-xs text-muted-foreground">
                    {metrics.transactions24h.toLocaleString()} txns
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            {['24h', '7d', '30d', '1y', 'All'].map((period) => (
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
          <Button
            size="sm"
            variant={autoRefresh ? 'default' : 'outline'}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </Button>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="vesting">Vesting</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="deflationary">Deflationary</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Supply Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Supply Metrics</CardTitle>
                  <CardDescription>
                    Token supply distribution and circulation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Circulating Supply</span>
                        <span>{(metrics.circulatingSupply / 1000000).toFixed(0)}M / {(metrics.maxSupply / 1000000).toFixed(0)}M</span>
                      </div>
                      <Progress value={circulatingPercentage} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">{circulatingPercentage.toFixed(1)}% of max supply</p>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Staked Tokens</span>
                        <span>{(metrics.stakedTokens / 1000000).toFixed(0)}M</span>
                      </div>
                      <Progress value={stakedPercentage} className="h-2 bg-purple-500/20" />
                      <p className="text-xs text-muted-foreground mt-1">{stakedPercentage.toFixed(1)}% of circulating</p>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Liquidity Locked</span>
                        <span>{(metrics.liquidityLocked / 1000000).toFixed(0)}M</span>
                      </div>
                      <Progress value={lockedPercentage} className="h-2 bg-blue-500/20" />
                      <p className="text-xs text-muted-foreground mt-1">{lockedPercentage.toFixed(1)}% of circulating</p>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Burned Tokens</span>
                        <span>{(metrics.burnedTokens / 1000000).toFixed(0)}M</span>
                      </div>
                      <Progress value={burnedPercentage} className="h-2 bg-red-500/20" />
                      <p className="text-xs text-muted-foreground mt-1">{burnedPercentage.toFixed(1)}% of max supply</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t">
                    <h4 className="font-medium mb-3">Supply Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Max Supply:</span>
                        <span className="font-mono">{metrics.maxSupply.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Supply:</span>
                        <span className="font-mono">{metrics.totalSupply.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">FDV:</span>
                        <span>${(metrics.fullyDilutedValuation / 1000000).toFixed(0)}M</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Supply Breakdown Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Supply Breakdown</CardTitle>
                  <CardDescription>
                    Visual representation of token supply status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Doughnut data={supplyBreakdownData} options={doughnutOptions} />
                  </div>
                </CardContent>
              </Card>

              {/* Price History */}
              <Card>
                <CardHeader>
                  <CardTitle>Price History</CardTitle>
                  <CardDescription>
                    Historical price performance over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Line data={priceHistoryData} options={chartOptions} />
                  </div>
                </CardContent>
              </Card>

              {/* Emission Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle>Emission Schedule</CardTitle>
                  <CardDescription>
                    10-year token release and burn projection
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Bar data={emissionScheduleData} options={chartOptions} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Distribution Tab */}
          <TabsContent value="distribution" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Token Allocation</CardTitle>
                  <CardDescription>
                    Initial token distribution across categories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <Doughnut data={distributionData} options={doughnutOptions} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Allocation Details</CardTitle>
                  <CardDescription>
                    Breakdown of token allocations by category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {vestingSchedule.map((item) => (
                      <div key={item.category} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="font-medium">{item.category}</span>
                          </div>
                          <Badge variant="outline">{item.percentage}%</Badge>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between text-muted-foreground">
                            <span>Allocation:</span>
                            <span className="font-mono">{(item.allocation / 1000000).toFixed(0)}M tokens</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Released:</span>
                            <span className="text-green-500">{(item.released / 1000000).toFixed(0)}M</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Locked:</span>
                            <span className="text-yellow-500">{(item.locked / 1000000).toFixed(0)}M</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Vesting Tab */}
          <TabsContent value="vesting" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Vesting Schedule</CardTitle>
                <CardDescription>
                  Token unlock timeline and vesting details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Category</th>
                        <th className="text-right p-2">Total Allocation</th>
                        <th className="text-right p-2">Released</th>
                        <th className="text-right p-2">Locked</th>
                        <th className="text-left p-2">Schedule</th>
                        <th className="text-left p-2">Next Unlock</th>
                        <th className="text-right p-2">Progress</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vestingSchedule.map((item) => (
                        <tr key={item.category} className="border-b">
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-2 h-2 rounded-full" 
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="font-medium">{item.category}</span>
                            </div>
                          </td>
                          <td className="text-right p-2 font-mono text-sm">
                            {(item.allocation / 1000000).toFixed(0)}M
                          </td>
                          <td className="text-right p-2 text-green-500 font-mono text-sm">
                            {(item.released / 1000000).toFixed(0)}M
                          </td>
                          <td className="text-right p-2 text-yellow-500 font-mono text-sm">
                            {(item.locked / 1000000).toFixed(0)}M
                          </td>
                          <td className="p-2 text-sm text-muted-foreground">
                            {item.schedule}
                          </td>
                          <td className="p-2">
                            <Badge variant={item.nextUnlock === 'Completed' ? 'secondary' : 'outline'}>
                              {item.nextUnlock}
                            </Badge>
                          </td>
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <Progress 
                                value={(item.released / item.allocation) * 100} 
                                className="h-2 w-20"
                              />
                              <span className="text-xs text-muted-foreground">
                                {((item.released / item.allocation) * 100).toFixed(0)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Alert className="mt-6">
                  <Lock className="w-4 h-4" />
                  <AlertDescription>
                    All vesting schedules are enforced through smart contracts and cannot be modified. 
                    Tokens are automatically released according to the predetermined schedule.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Velocity</span>
                    <Activity className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold">2.8x</p>
                  <p className="text-xs text-muted-foreground">Trading volume / Market cap</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Staking APY</span>
                    <Award className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold">18.5%</p>
                  <p className="text-xs text-muted-foreground">Annual percentage yield</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Burn Rate</span>
                    <Flame className="w-4 h-4 text-red-500" />
                  </div>
                  <p className="text-2xl font-bold">0.5%</p>
                  <p className="text-xs text-muted-foreground">Monthly burn percentage</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Whale Concentration</span>
                    <PieChart className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold">12%</p>
                  <p className="text-xs text-muted-foreground">Top 10 holders ownership</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Active Addresses</span>
                    <Users className="w-4 h-4 text-purple-500" />
                  </div>
                  <p className="text-2xl font-bold">45.2K</p>
                  <p className="text-xs text-muted-foreground">30-day active users</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Network Value</span>
                    <Network className="w-4 h-4 text-yellow-500" />
                  </div>
                  <p className="text-2xl font-bold">$328M</p>
                  <p className="text-xs text-muted-foreground">Total value locked</p>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Token Utility</CardTitle>
                <CardDescription>
                  MOLOCHAIN token use cases within the ecosystem
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Primary Utilities</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Transaction Fees</p>
                          <p className="text-xs text-muted-foreground">Pay for logistics transactions on-chain</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Staking Rewards</p>
                          <p className="text-xs text-muted-foreground">Earn yields by securing the network</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Governance Voting</p>
                          <p className="text-xs text-muted-foreground">Participate in protocol decisions</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Secondary Utilities</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <Zap className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Premium Features</p>
                          <p className="text-xs text-muted-foreground">Access advanced platform capabilities</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <Zap className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">NFT Marketplace</p>
                          <p className="text-xs text-muted-foreground">Trade tokenized logistics assets</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <Zap className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Liquidity Provision</p>
                          <p className="text-xs text-muted-foreground">Earn fees from DEX pools</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Deflationary Tab */}
          <TabsContent value="deflationary" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Deflationary Mechanisms</CardTitle>
                  <CardDescription>
                    Token burn mechanisms reducing supply over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Flame className="w-4 h-4 text-red-500" />
                          <span className="font-medium">Transaction Fee Burns</span>
                        </div>
                        <Badge variant="destructive">Active</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        30% of all transaction fees are permanently burned
                      </p>
                      <div className="flex justify-between text-xs">
                        <span>Burned this month:</span>
                        <span className="font-mono">2.5M tokens</span>
                      </div>
                    </div>

                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">Buyback & Burn</span>
                        </div>
                        <Badge variant="outline">Quarterly</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Platform profits used to buy and burn tokens
                      </p>
                      <div className="flex justify-between text-xs">
                        <span>Last buyback:</span>
                        <span className="font-mono">5M tokens</span>
                      </div>
                    </div>

                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-purple-500" />
                          <span className="font-medium">Penalty Burns</span>
                        </div>
                        <Badge variant="secondary">Variable</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Penalties for contract violations are burned
                      </p>
                      <div className="flex justify-between text-xs">
                        <span>Total penalties burned:</span>
                        <span className="font-mono">1.2M tokens</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Burn Statistics</CardTitle>
                  <CardDescription>
                    Historical and projected token burns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Total Burned</span>
                        <span className="text-2xl font-bold text-red-500">
                          {(metrics.burnedTokens / 1000000).toFixed(1)}M
                        </span>
                      </div>
                      <Progress value={burnedPercentage} className="h-3 bg-red-500/20" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {burnedPercentage.toFixed(2)}% of max supply permanently removed
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Monthly Burn Rate</p>
                        <p className="font-medium">~2.5M tokens</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Annual Projection</p>
                        <p className="font-medium">~30M tokens</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Burn Acceleration</p>
                        <p className="font-medium text-green-500">+15% YoY</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Supply Reduction</p>
                        <p className="font-medium">-2.5% annually</p>
                      </div>
                    </div>

                    <Alert>
                      <Info className="w-4 h-4" />
                      <AlertDescription>
                        The deflationary model ensures long-term value appreciation by continuously 
                        reducing the token supply while demand grows with platform adoption.
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>

              {/* Future Projections */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Economic Projections</CardTitle>
                  <CardDescription>
                    5-year outlook based on current metrics and growth trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="p-3 bg-gradient-to-br from-green-500/10 to-transparent rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">2025 Price Target</p>
                      <p className="text-xl font-bold">$1.20</p>
                      <p className="text-xs text-green-500">+60% potential</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-blue-500/10 to-transparent rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">2026 Market Cap</p>
                      <p className="text-xl font-bold">$250M</p>
                      <p className="text-xs text-blue-500">3.3x growth</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-purple-500/10 to-transparent rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">2028 Circulation</p>
                      <p className="text-xl font-bold">350M</p>
                      <p className="text-xs text-purple-500">35% of max</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-red-500/10 to-transparent rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">2030 Total Burn</p>
                      <p className="text-xl font-bold">200M</p>
                      <p className="text-xs text-red-500">20% burned</p>
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

export default TokenEconomics;