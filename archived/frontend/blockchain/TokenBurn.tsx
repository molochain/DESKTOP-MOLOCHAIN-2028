import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Flame,
  TrendingDown,
  DollarSign,
  Activity,
  Calendar,
  Clock,
  Target,
  BarChart3,
  PieChart,
  Hash,
  AlertCircle,
  CheckCircle,
  ArrowDown,
  ArrowUp,
  Coins,
  Info,
  Timer,
  Zap,
  Shield,
  TrendingUp,
  ChevronRight
} from "lucide-react";
import { useState } from "react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
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

interface BurnEvent {
  id: string;
  timestamp: Date;
  amount: number;
  source: 'buyback' | 'fees' | 'penalty' | 'manual' | 'scheduled';
  txHash: string;
  blockNumber: number;
  usdValue: number;
}

interface BurnStats {
  totalBurned: number;
  burnedLast24h: number;
  burnedLast7d: number;
  burnedLast30d: number;
  percentageOfSupply: number;
  burnRate: number;
  nextScheduledBurn: Date;
  estimatedYearlyBurn: number;
}

const TokenBurn = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  
  const burnStats: BurnStats = {
    totalBurned: 45892374,
    burnedLast24h: 128493,
    burnedLast7d: 892374,
    burnedLast30d: 3847293,
    percentageOfSupply: 4.59,
    burnRate: 0.12,
    nextScheduledBurn: new Date('2024-12-15'),
    estimatedYearlyBurn: 15000000
  };

  const burnEvents: BurnEvent[] = [
    {
      id: 'BURN001',
      timestamp: new Date('2024-12-05 14:30:00'),
      amount: 250000,
      source: 'buyback',
      txHash: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bE8b',
      blockNumber: 18234567,
      usdValue: 112500
    },
    {
      id: 'BURN002',
      timestamp: new Date('2024-12-04 09:15:00'),
      amount: 185000,
      source: 'fees',
      txHash: '0x8B3c44Dd5634C0532925a3b844Bc9e7595f0bE9c',
      blockNumber: 18234123,
      usdValue: 83250
    },
    {
      id: 'BURN003',
      timestamp: new Date('2024-12-03 16:45:00'),
      amount: 92000,
      source: 'penalty',
      txHash: '0x9C4d55Ee6745D1643036b4a955Cd0f8706g1cF0d',
      blockNumber: 18233890,
      usdValue: 41400
    },
    {
      id: 'BURN004',
      timestamp: new Date('2024-12-02 11:20:00'),
      amount: 500000,
      source: 'scheduled',
      txHash: '0xA5e655Ff8856E2643136c5b956Ce1g9817h2dG1e',
      blockNumber: 18233456,
      usdValue: 225000
    },
    {
      id: 'BURN005',
      timestamp: new Date('2024-12-01 08:00:00'),
      amount: 150000,
      source: 'manual',
      txHash: '0xB6f766Gg9967F3754247d6c067Df2h0928i3eH2f',
      blockNumber: 18233001,
      usdValue: 67500
    }
  ];

  const getSourceIcon = (source: string) => {
    switch(source) {
      case 'buyback': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'fees': return <Coins className="w-4 h-4 text-blue-500" />;
      case 'penalty': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'manual': return <Shield className="w-4 h-4 text-purple-500" />;
      case 'scheduled': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <Flame className="w-4 h-4" />;
    }
  };

  const getSourceColor = (source: string) => {
    switch(source) {
      case 'buyback': return 'bg-green-500/10 text-green-500';
      case 'fees': return 'bg-blue-500/10 text-blue-500';
      case 'penalty': return 'bg-red-500/10 text-red-500';
      case 'manual': return 'bg-purple-500/10 text-purple-500';
      case 'scheduled': return 'bg-yellow-500/10 text-yellow-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  // Chart data
  const burnHistoryData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Tokens Burned',
        data: [2800000, 3200000, 2900000, 3500000, 3800000, 4100000, 3900000, 4200000, 4500000, 3700000, 3900000, 3847293],
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }
    ]
  };

  const burnSourceData = {
    labels: ['Buyback', 'Fees', 'Penalty', 'Scheduled', 'Manual'],
    datasets: [
      {
        data: [35, 28, 12, 20, 5],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(250, 204, 21, 0.8)',
          'rgba(168, 85, 247, 0.8)'
        ],
        borderWidth: 0
      }
    ]
  };

  const supplyReductionData = {
    labels: ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024', 'Q1 2025', 'Q2 2025'],
    datasets: [
      {
        label: 'Circulating Supply',
        data: [1000000000, 990000000, 975000000, 954000000, 930000000, 900000000],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2
      },
      {
        label: 'Total Burned',
        data: [0, 10000000, 25000000, 46000000, 70000000, 100000000],
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 2
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border-b">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <Badge className="mb-4" variant="outline">
              <Flame className="w-3 h-3 mr-1" /> Deflationary Mechanism
            </Badge>
            <h1 className="text-4xl font-bold mb-4">Token Burn Tracker</h1>
            <p className="text-muted-foreground text-lg">
              Monitor MOLOCHAIN's deflationary tokenomics with real-time burn tracking, 
              supply reduction metrics, and automated buyback mechanisms.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Burned</p>
                  <p className="text-2xl font-bold">45.89M</p>
                  <p className="text-xs text-red-500">
                    {burnStats.percentageOfSupply}% of supply
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
                  <Flame className="w-6 h-6 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">24h Burn</p>
                  <p className="text-2xl font-bold">128.5K</p>
                  <p className="text-xs text-green-500 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +15.3%
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Burn Rate</p>
                  <p className="text-2xl font-bold">{burnStats.burnRate}%</p>
                  <p className="text-xs text-muted-foreground">Monthly avg</p>
                </div>
                <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Next Burn</p>
                  <p className="text-2xl font-bold">6 days</p>
                  <p className="text-xs text-muted-foreground">Dec 15, 2024</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Timer className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Charts Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Burn History Chart */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Burn History</CardTitle>
                  <div className="flex gap-2">
                    {['7d', '30d', '90d', '1y'].map((period) => (
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
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <Line data={burnHistoryData} options={chartOptions} />
                </div>
              </CardContent>
            </Card>

            {/* Supply Reduction Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Supply Reduction Timeline</CardTitle>
                <CardDescription>
                  Tracking the systematic reduction in circulating supply
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <Bar data={supplyReductionData} options={chartOptions} />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                  <div className="p-3 bg-muted rounded">
                    <p className="text-muted-foreground">Initial Supply</p>
                    <p className="font-semibold">1B MOLOCHAIN</p>
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <p className="text-muted-foreground">Current Supply</p>
                    <p className="font-semibold">954M MOLOCHAIN</p>
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <p className="text-muted-foreground">2025 Target</p>
                    <p className="font-semibold">900M MOLOCHAIN</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Burn Events */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Burn Events</CardTitle>
                <CardDescription>
                  Live tracking of token burn transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {burnEvents.map((event) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {getSourceIcon(event.source)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">
                                {event.amount.toLocaleString()} MOLOCHAIN
                              </span>
                              <Badge className={getSourceColor(event.source)} variant="secondary">
                                {event.source}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>
                                {event.timestamp.toLocaleDateString()} {event.timestamp.toLocaleTimeString()}
                              </span>
                              <span>Block #{event.blockNumber}</span>
                              <span>${event.usdValue.toLocaleString()}</span>
                            </div>
                            <div className="mt-1">
                              <a 
                                href="#" 
                                className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                              >
                                {event.txHash.slice(0, 10)}...{event.txHash.slice(-8)}
                                <ChevronRight className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Burn Sources */}
            <Card>
              <CardHeader>
                <CardTitle>Burn Sources</CardTitle>
                <CardDescription>
                  Distribution of token burns by source
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <Doughnut data={burnSourceData} options={doughnutOptions} />
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Buyback Program</span>
                    <span className="font-medium">35%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Transaction Fees</span>
                    <span className="font-medium">28%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Penalty Burns</span>
                    <span className="font-medium">12%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Scheduled Burns</span>
                    <span className="font-medium">20%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Manual Burns</span>
                    <span className="font-medium">5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Burn Mechanisms */}
            <Card>
              <CardHeader>
                <CardTitle>Active Mechanisms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Buyback & Burn</p>
                      <p className="text-xs text-muted-foreground">
                        10% of platform fees used for token buyback
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Coins className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Transaction Fee Burn</p>
                      <p className="text-xs text-muted-foreground">
                        0.1% of all transactions burned automatically
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-yellow-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Quarterly Burns</p>
                      <p className="text-xs text-muted-foreground">
                        Scheduled burns every 3 months
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Penalty Burns</p>
                      <p className="text-xs text-muted-foreground">
                        Early unstaking penalties are burned
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Projections */}
            <Card className="bg-gradient-to-r from-purple-500/5 to-pink-500/5 border-purple-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  2025 Projections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Est. Total Burn</span>
                      <span className="font-medium">100M MOLOCHAIN</span>
                    </div>
                    <Progress value={45.89} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">45.89% achieved</p>
                  </div>

                  <div className="pt-3 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Supply Reduction</span>
                      <span className="font-medium">10%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Price Impact</span>
                      <span className="font-medium text-green-500">+25-35%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Holder Benefit</span>
                      <span className="font-medium text-green-500">+11.1%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Info Box */}
            <Card className="bg-gradient-to-r from-blue-500/5 to-purple-500/5 border-blue-500/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm mb-1">Deflationary Model</p>
                    <p className="text-xs text-muted-foreground">
                      MOLOCHAIN implements a systematic token burn mechanism that permanently 
                      removes tokens from circulation, increasing scarcity and value for holders. 
                      All burns are transparent and verifiable on-chain.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenBurn;