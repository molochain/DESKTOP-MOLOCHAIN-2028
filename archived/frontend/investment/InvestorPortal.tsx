import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Building,
  Globe,
  Shield,
  Lock,
  Wallet,
  PieChart,
  BarChart3,
  LineChart,
  Activity,
  Target,
  Award,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Info,
  FileText,
  Download,
  Upload,
  Send,
  MessageSquare,
  Video,
  Calendar,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Copy,
  Share2,
  Printer,
  QrCode,
  Zap,
  Briefcase,
  CreditCard,
  ChevronRight,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Coins,
  Gem,
  Trophy,
  Flag,
  Rocket,
  Heart,
  Eye,
  EyeOff,
  RefreshCw,
  Plus,
  Settings,
  HelpCircle,
  LogOut,
  Link,
  Key,
  ChartLine,
  Package,
  Truck,
  Ship,
  Plane,
  Train,
  Anchor,
  Navigation,
  Timer,
  Database,
  Server,
  Cpu,
  GitBranch,
  GitCommit,
  GitMerge,
  Code,
  Terminal,
  Layers,
  Grid,
  Layout,
  Maximize,
  Minimize,
  Move,
  MoreVertical,
  MoreHorizontal
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart as RePieChart, Pie, Cell, LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart } from 'recharts';
import { format, addDays, subDays, startOfMonth, endOfMonth } from 'date-fns';

interface Investment {
  id: string;
  date: Date;
  amount: number;
  type: 'seed' | 'series-a' | 'series-b' | 'series-c' | 'strategic';
  tokens: number;
  vestingSchedule: VestingSchedule;
  transactionHash: string;
  status: 'pending' | 'confirmed' | 'vested' | 'partial';
}

interface VestingSchedule {
  total: number;
  released: number;
  cliff: Date;
  duration: number; // months
  schedule: VestingPeriod[];
}

interface VestingPeriod {
  date: Date;
  amount: number;
  status: 'locked' | 'available' | 'claimed';
}

interface PortfolioMetrics {
  totalInvested: number;
  currentValue: number;
  roi: number;
  tokens: number;
  vestedTokens: number;
  lockedTokens: number;
  rank: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
}

interface FundingRound {
  id: string;
  name: string;
  target: number;
  raised: number;
  investors: number;
  startDate: Date;
  endDate: Date;
  minInvestment: number;
  maxInvestment: number;
  tokenPrice: number;
  bonus: number;
  status: 'upcoming' | 'active' | 'closed';
  documents: Document[];
}

interface Document {
  id: string;
  name: string;
  type: 'whitepaper' | 'pitch-deck' | 'financials' | 'legal' | 'tokenomics';
  url: string;
  size: number;
  uploadedAt: Date;
}

interface News {
  id: string;
  title: string;
  category: 'announcement' | 'partnership' | 'milestone' | 'market' | 'product';
  date: Date;
  content: string;
  impact: 'positive' | 'neutral' | 'negative';
}

interface WalletConnection {
  address: string;
  network: string;
  balance: number;
  connected: boolean;
  provider: 'metamask' | 'walletconnect' | 'coinbase' | 'phantom' | 'trust';
}

export default function InvestorPortal() {
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [wallet, setWallet] = useState<WalletConnection | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioMetrics | null>(null);
  const [fundingRounds, setFundingRounds] = useState<FundingRound[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [selectedRound, setSelectedRound] = useState<FundingRound | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USDT');
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  // Performance data
  const performanceData = [
    { month: 'Jan', value: 100000, roi: 0 },
    { month: 'Feb', value: 108000, roi: 8 },
    { month: 'Mar', value: 115000, roi: 15 },
    { month: 'Apr', value: 128000, roi: 28 },
    { month: 'May', value: 142000, roi: 42 },
    { month: 'Jun', value: 165000, roi: 65 }
  ];

  // Token allocation
  const tokenAllocation = [
    { name: 'Available', value: 35, amount: 35000, color: '#10B981' },
    { name: 'Vested', value: 25, amount: 25000, color: '#3B82F6' },
    { name: 'Locked', value: 40, amount: 40000, color: '#8B5CF6' }
  ];

  // Market metrics
  const marketMetrics = {
    tokenPrice: 2.85,
    priceChange24h: 12.5,
    marketCap: 285000000,
    volume24h: 45000000,
    circulatingSupply: 100000000,
    totalSupply: 1000000000,
    fdv: 2850000000,
    ath: 3.45,
    atl: 0.85
  };

  // Company metrics
  const companyMetrics = {
    revenue: 45000000,
    revenueGrowth: 185,
    customers: 850,
    customerGrowth: 95,
    countries: 47,
    employees: 320,
    valuation: 500000000,
    runwayMonths: 24
  };

  // Initialize sample data
  useEffect(() => {
    // Sample portfolio
    const samplePortfolio: PortfolioMetrics = {
      totalInvested: 150000,
      currentValue: 247500,
      roi: 65,
      tokens: 100000,
      vestedTokens: 35000,
      lockedTokens: 40000,
      rank: 12,
      tier: 'platinum'
    };

    // Sample investments
    const sampleInvestments: Investment[] = [
      {
        id: 'INV001',
        date: subDays(new Date(), 180),
        amount: 50000,
        type: 'seed',
        tokens: 40000,
        vestingSchedule: {
          total: 40000,
          released: 15000,
          cliff: subDays(new Date(), 90),
          duration: 24,
          schedule: [
            {
              date: subDays(new Date(), 90),
              amount: 10000,
              status: 'claimed'
            },
            {
              date: addDays(new Date(), 90),
              amount: 10000,
              status: 'available'
            },
            {
              date: addDays(new Date(), 180),
              amount: 10000,
              status: 'locked'
            },
            {
              date: addDays(new Date(), 270),
              amount: 10000,
              status: 'locked'
            }
          ]
        },
        transactionHash: '0x1234...5678',
        status: 'partial'
      },
      {
        id: 'INV002',
        date: subDays(new Date(), 120),
        amount: 75000,
        type: 'series-a',
        tokens: 45000,
        vestingSchedule: {
          total: 45000,
          released: 20000,
          cliff: subDays(new Date(), 30),
          duration: 18,
          schedule: [
            {
              date: subDays(new Date(), 30),
              amount: 15000,
              status: 'claimed'
            },
            {
              date: addDays(new Date(), 60),
              amount: 15000,
              status: 'available'
            },
            {
              date: addDays(new Date(), 150),
              amount: 15000,
              status: 'locked'
            }
          ]
        },
        transactionHash: '0x8765...4321',
        status: 'partial'
      },
      {
        id: 'INV003',
        date: subDays(new Date(), 30),
        amount: 25000,
        type: 'strategic',
        tokens: 15000,
        vestingSchedule: {
          total: 15000,
          released: 0,
          cliff: addDays(new Date(), 60),
          duration: 12,
          schedule: [
            {
              date: addDays(new Date(), 60),
              amount: 5000,
              status: 'locked'
            },
            {
              date: addDays(new Date(), 120),
              amount: 5000,
              status: 'locked'
            },
            {
              date: addDays(new Date(), 180),
              amount: 5000,
              status: 'locked'
            }
          ]
        },
        transactionHash: '0xabcd...efgh',
        status: 'confirmed'
      }
    ];

    // Sample funding rounds
    const sampleRounds: FundingRound[] = [
      {
        id: 'ROUND001',
        name: 'Series B',
        target: 50000000,
        raised: 32500000,
        investors: 145,
        startDate: subDays(new Date(), 30),
        endDate: addDays(new Date(), 30),
        minInvestment: 10000,
        maxInvestment: 1000000,
        tokenPrice: 2.50,
        bonus: 20,
        status: 'active',
        documents: [
          {
            id: 'DOC001',
            name: 'Series B Pitch Deck',
            type: 'pitch-deck',
            url: '#',
            size: 5242880,
            uploadedAt: subDays(new Date(), 45)
          },
          {
            id: 'DOC002',
            name: 'Financial Projections 2025-2030',
            type: 'financials',
            url: '#',
            size: 2097152,
            uploadedAt: subDays(new Date(), 40)
          },
          {
            id: 'DOC003',
            name: 'MoloChain Tokenomics v2.0',
            type: 'tokenomics',
            url: '#',
            size: 3145728,
            uploadedAt: subDays(new Date(), 35)
          }
        ]
      },
      {
        id: 'ROUND002',
        name: 'Strategic Round',
        target: 15000000,
        raised: 15000000,
        investors: 42,
        startDate: subDays(new Date(), 90),
        endDate: subDays(new Date(), 30),
        minInvestment: 50000,
        maxInvestment: 2000000,
        tokenPrice: 2.00,
        bonus: 0,
        status: 'closed',
        documents: []
      }
    ];

    // Sample news
    const sampleNews: News[] = [
      {
        id: 'NEWS001',
        title: 'MoloChain Partners with Maersk for Global Shipping Integration',
        category: 'partnership',
        date: subDays(new Date(), 2),
        content: 'Strategic partnership to integrate blockchain technology across 700+ vessels',
        impact: 'positive'
      },
      {
        id: 'NEWS002',
        title: 'Q2 Revenue Exceeds $15M, Up 185% YoY',
        category: 'milestone',
        date: subDays(new Date(), 7),
        content: 'Record quarter driven by enterprise adoption and new product launches',
        impact: 'positive'
      },
      {
        id: 'NEWS003',
        title: 'MoloChain Token Listed on Binance and Coinbase',
        category: 'announcement',
        date: subDays(new Date(), 14),
        content: 'MOLO token now available for trading on major exchanges',
        impact: 'positive'
      },
      {
        id: 'NEWS004',
        title: 'Launch of AI-Powered Supply Chain Optimization',
        category: 'product',
        date: subDays(new Date(), 21),
        content: 'New AI features reduce logistics costs by average 23%',
        impact: 'positive'
      }
    ];

    setPortfolio(samplePortfolio);
    setInvestments(sampleInvestments);
    setFundingRounds(sampleRounds);
    setNews(sampleNews);
  }, []);

  const connectWallet = async (provider: string) => {
    // Simulate wallet connection
    const mockWallet: WalletConnection = {
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9',
      network: 'Ethereum Mainnet',
      balance: 5.234,
      connected: true,
      provider: provider as any
    };
    setWallet(mockWallet);
  };

  const disconnectWallet = () => {
    setWallet(null);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'diamond': return 'text-cyan-600 bg-cyan-50';
      case 'platinum': return 'text-purple-600 bg-purple-50';
      case 'gold': return 'text-yellow-600 bg-yellow-50';
      case 'silver': return 'text-gray-600 bg-gray-50';
      case 'bronze': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'diamond': return <Gem className="h-5 w-5" />;
      case 'platinum': return <Trophy className="h-5 w-5" />;
      case 'gold': return <Award className="h-5 w-5" />;
      case 'silver': return <Star className="h-5 w-5" />;
      case 'bronze': return <Shield className="h-5 w-5" />;
      default: return <Shield className="h-5 w-5" />;
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const calculateTokensReceived = (amount: number, price: number, bonus: number) => {
    const baseTokens = amount / price;
    const bonusTokens = baseTokens * (bonus / 100);
    return baseTokens + bonusTokens;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Briefcase className="h-8 w-8 text-blue-600" />
            Investor Portal
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your investments and track portfolio performance
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {wallet ? (
            <>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                <Wallet className="h-4 w-4" />
                <span className="text-sm font-medium">{formatAddress(wallet.address)}</span>
                <Badge variant="outline" className="text-xs">
                  {wallet.network}
                </Badge>
              </div>
              <Button variant="outline" onClick={disconnectWallet}>
                <LogOut className="mr-2 h-4 w-4" />
                Disconnect
              </Button>
            </>
          ) : (
            <Button 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
              onClick={() => connectWallet('metamask')}
            >
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
          )}
        </div>
      </div>

      {/* Wallet Connection Options */}
      {!wallet && (
        <Card className="border-blue-500">
          <CardHeader>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Choose your preferred wallet to access investor features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {['MetaMask', 'WalletConnect', 'Coinbase', 'Phantom', 'Trust Wallet'].map((provider) => (
                <Button
                  key={provider}
                  variant="outline"
                  className="h-20 flex flex-col gap-2"
                  onClick={() => connectWallet(provider.toLowerCase().replace(' ', ''))}
                >
                  <Wallet className="h-6 w-6" />
                  <span className="text-xs">{provider}</span>
                </Button>
              ))}
            </div>
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertTitle>170+ Wallets Supported</AlertTitle>
              <AlertDescription>
                We support all major wallets including hardware wallets like Ledger and Trezor
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {wallet && (
        <>
          {/* Portfolio Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Invested</p>
                    <p className="text-2xl font-bold">
                      ${portfolio?.totalInvested.toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Value</p>
                    <p className="text-2xl font-bold">
                      ${portfolio?.currentValue.toLocaleString()}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
                <div className="mt-2 flex items-center text-xs text-green-600">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +{portfolio?.roi}% ROI
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">MOLO Tokens</p>
                    <p className="text-2xl font-bold">
                      {portfolio?.tokens.toLocaleString()}
                    </p>
                  </div>
                  <Coins className="h-8 w-8 text-purple-500" />
                </div>
                <Progress value={35} className="mt-2 h-1" />
                <p className="text-xs text-muted-foreground mt-1">
                  35% vested
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Investor Rank</p>
                    <p className="text-2xl font-bold">#{portfolio?.rank}</p>
                  </div>
                  {getTierIcon(portfolio?.tier || 'bronze')}
                </div>
                <Badge className={`mt-2 ${getTierColor(portfolio?.tier || 'bronze')}`}>
                  {portfolio?.tier?.toUpperCase()} TIER
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
            <TabsList className="grid grid-cols-7 w-full">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="invest">Invest</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="vesting">Vesting</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-4">
              {/* Market Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>MOLO Token Metrics</CardTitle>
                  <CardDescription>
                    Real-time market data and token performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Token Price</p>
                      <p className="text-xl font-bold">${marketMetrics.tokenPrice}</p>
                      <div className="flex items-center text-xs text-green-600 mt-1">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        +{marketMetrics.priceChange24h}% (24h)
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Market Cap</p>
                      <p className="text-xl font-bold">
                        ${(marketMetrics.marketCap / 1000000).toFixed(0)}M
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">24h Volume</p>
                      <p className="text-xl font-bold">
                        ${(marketMetrics.volume24h / 1000000).toFixed(1)}M
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Circulating</p>
                      <p className="text-xl font-bold">
                        {(marketMetrics.circulatingSupply / 1000000).toFixed(0)}M
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">FDV</p>
                      <p className="text-xl font-bold">
                        ${(marketMetrics.fdv / 1000000000).toFixed(1)}B
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Portfolio Performance</CardTitle>
                    <CardDescription>
                      Your investment value over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#3B82F6"
                          fill="#3B82F6"
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Token Allocation</CardTitle>
                    <CardDescription>
                      Distribution of your MOLO tokens
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <RePieChart>
                        <Pie
                          data={tokenAllocation}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.name}: ${entry.amount.toLocaleString()}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {tokenAllocation.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RePieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Company Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Company Performance</CardTitle>
                  <CardDescription>
                    Key business metrics and growth indicators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-muted-foreground">Revenue</p>
                        <DollarSign className="h-4 w-4 text-green-500" />
                      </div>
                      <p className="text-xl font-bold">
                        ${(companyMetrics.revenue / 1000000).toFixed(0)}M
                      </p>
                      <div className="flex items-center text-xs text-green-600 mt-1">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +{companyMetrics.revenueGrowth}% YoY
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-muted-foreground">Customers</p>
                        <Users className="h-4 w-4 text-blue-500" />
                      </div>
                      <p className="text-xl font-bold">{companyMetrics.customers}</p>
                      <div className="flex items-center text-xs text-green-600 mt-1">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +{companyMetrics.customerGrowth}% YoY
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-muted-foreground">Countries</p>
                        <Globe className="h-4 w-4 text-purple-500" />
                      </div>
                      <p className="text-xl font-bold">{companyMetrics.countries}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Global presence
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-muted-foreground">Valuation</p>
                        <Rocket className="h-4 w-4 text-orange-500" />
                      </div>
                      <p className="text-xl font-bold">
                        ${(companyMetrics.valuation / 1000000).toFixed(0)}M
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {companyMetrics.runwayMonths} months runway
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Latest News */}
              <Card>
                <CardHeader>
                  <CardTitle>Latest Updates</CardTitle>
                  <CardDescription>
                    Company news and announcements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {news.map((item) => (
                      <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className={`p-2 rounded-lg ${
                          item.impact === 'positive' ? 'bg-green-100' :
                          item.impact === 'negative' ? 'bg-red-100' : 'bg-gray-100'
                        }`}>
                          {item.category === 'partnership' && <Users className="h-4 w-4" />}
                          {item.category === 'milestone' && <Trophy className="h-4 w-4" />}
                          {item.category === 'announcement' && <Info className="h-4 w-4" />}
                          {item.category === 'product' && <Package className="h-4 w-4" />}
                          {item.category === 'market' && <TrendingUp className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{item.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{item.content}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {format(item.date, 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="invest" className="space-y-4">
              {/* Active Funding Round */}
              <Alert className="border-green-200 bg-green-50">
                <Rocket className="h-4 w-4" />
                <AlertTitle>Series B Funding Round Active</AlertTitle>
                <AlertDescription>
                  Limited time opportunity - 20% bonus tokens for investments over $50,000
                </AlertDescription>
              </Alert>

              {/* Funding Rounds */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {fundingRounds.map((round) => (
                  <Card key={round.id} className={round.status === 'active' ? 'border-green-500' : ''}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{round.name}</CardTitle>
                          <CardDescription>
                            Target: ${(round.target / 1000000).toFixed(0)}M
                          </CardDescription>
                        </div>
                        <Badge variant={
                          round.status === 'active' ? 'default' :
                          round.status === 'upcoming' ? 'secondary' : 'outline'
                        }>
                          {round.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span className="font-medium">
                              ${(round.raised / 1000000).toFixed(1)}M / ${(round.target / 1000000).toFixed(0)}M
                            </span>
                          </div>
                          <Progress value={(round.raised / round.target) * 100} className="h-2" />
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">Token Price</p>
                            <p className="font-medium">${round.tokenPrice}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Bonus</p>
                            <p className="font-medium text-green-600">+{round.bonus}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Min Investment</p>
                            <p className="font-medium">${round.minInvestment.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Investors</p>
                            <p className="font-medium">{round.investors}</p>
                          </div>
                        </div>

                        {round.status === 'active' && (
                          <Button 
                            className="w-full"
                            onClick={() => setSelectedRound(round)}
                          >
                            Invest Now
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Investment Calculator */}
              {selectedRound && (
                <Card>
                  <CardHeader>
                    <CardTitle>Investment Calculator</CardTitle>
                    <CardDescription>
                      Calculate your token allocation for {selectedRound.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Investment Amount</Label>
                          <Input
                            type="number"
                            placeholder="Enter amount..."
                            value={investmentAmount}
                            onChange={(e) => setInvestmentAmount(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Payment Currency</Label>
                          <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USDT">USDT</SelectItem>
                              <SelectItem value="USDC">USDC</SelectItem>
                              <SelectItem value="ETH">ETH</SelectItem>
                              <SelectItem value="BTC">BTC</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {investmentAmount && (
                        <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Investment Amount</span>
                            <span className="font-medium">
                              ${Number(investmentAmount).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Token Price</span>
                            <span className="font-medium">${selectedRound.tokenPrice}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Base Tokens</span>
                            <span className="font-medium">
                              {Math.floor(Number(investmentAmount) / selectedRound.tokenPrice).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-green-600">
                            <span className="text-sm">Bonus ({selectedRound.bonus}%)</span>
                            <span className="font-medium">
                              +{Math.floor((Number(investmentAmount) / selectedRound.tokenPrice) * (selectedRound.bonus / 100)).toLocaleString()}
                            </span>
                          </div>
                          <Separator />
                          <div className="flex justify-between text-lg font-bold">
                            <span>Total MOLO Tokens</span>
                            <span>
                              {Math.floor(calculateTokensReceived(
                                Number(investmentAmount),
                                selectedRound.tokenPrice,
                                selectedRound.bonus
                              )).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button className="flex-1">
                          <Send className="mr-2 h-4 w-4" />
                          Proceed to Investment
                        </Button>
                        <Button variant="outline" onClick={() => setSelectedRound(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="portfolio" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Investment History</CardTitle>
                  <CardDescription>
                    Your complete investment transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {investments.map((investment) => (
                      <div key={investment.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {investment.type.toUpperCase()}
                              </Badge>
                              <Badge className={
                                investment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                investment.status === 'vested' ? 'bg-blue-100 text-blue-800' :
                                investment.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }>
                                {investment.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Amount</p>
                                <p className="font-medium">${investment.amount.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Tokens</p>
                                <p className="font-medium">{investment.tokens.toLocaleString()} MOLO</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Date</p>
                                <p className="font-medium">{format(investment.date, 'MMM dd, yyyy')}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Vested</p>
                                <p className="font-medium">
                                  {investment.vestingSchedule.released.toLocaleString()} / {investment.vestingSchedule.total.toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Link className="h-3 w-3" />
                              <span>Tx: {investment.transactionHash}</span>
                              <Button variant="ghost" size="sm" className="h-5 px-1">
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vesting" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Vesting Schedule</CardTitle>
                  <CardDescription>
                    Track your token vesting and claim available tokens
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {investments.map((investment) => (
                      <div key={investment.id} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">
                              {investment.type.toUpperCase()} Round - {investment.tokens.toLocaleString()} MOLO
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Cliff: {format(investment.vestingSchedule.cliff, 'MMM dd, yyyy')} • 
                              Duration: {investment.vestingSchedule.duration} months
                            </p>
                          </div>
                          <Badge variant="outline">
                            {Math.round((investment.vestingSchedule.released / investment.vestingSchedule.total) * 100)}% Vested
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          {investment.vestingSchedule.schedule.map((period, index) => (
                            <div key={index} className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${
                                period.status === 'claimed' ? 'bg-green-500' :
                                period.status === 'available' ? 'bg-blue-500' :
                                'bg-gray-300'
                              }`} />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm">
                                    {format(period.date, 'MMM dd, yyyy')}
                                  </span>
                                  <span className="text-sm font-medium">
                                    {period.amount.toLocaleString()} MOLO
                                  </span>
                                </div>
                                <Progress 
                                  value={period.status === 'claimed' ? 100 : period.status === 'available' ? 100 : 0} 
                                  className="h-1 mt-1"
                                />
                              </div>
                              {period.status === 'available' && (
                                <Button size="sm" variant="outline">
                                  Claim
                                </Button>
                              )}
                              {period.status === 'claimed' && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                              {period.status === 'locked' && (
                                <Lock className="h-4 w-4 text-gray-400" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              {/* Advanced Analytics Dashboard */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>ROI Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <ComposedChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="value" fill="#3B82F6" name="Portfolio Value" />
                        <Line yAxisId="right" type="monotone" dataKey="roi" stroke="#10B981" name="ROI %" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Investment Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={[
                        { metric: 'Seed', value: 50 },
                        { metric: 'Series A', value: 75 },
                        { metric: 'Series B', value: 25 },
                        { metric: 'Strategic', value: 25 },
                        { metric: 'Public', value: 0 }
                      ]}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="metric" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar name="Investment" dataKey="value" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Investment Documents</CardTitle>
                  <CardDescription>
                    Access all investment-related documents and reports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {fundingRounds[0].documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(doc.size / 1048576).toFixed(1)} MB • {format(doc.uploadedAt, 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Investor Settings</CardTitle>
                  <CardDescription>
                    Manage your investor profile and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">Wallet Settings</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Primary Wallet</Label>
                          <p className="text-sm text-muted-foreground">
                            {wallet?.address}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Change
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Recovery Address</Label>
                          <p className="text-sm text-muted-foreground">
                            Set a backup wallet for recovery
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-3">Notifications</h4>
                    <div className="space-y-3">
                      {[
                        { label: 'Investment Opportunities', description: 'New funding rounds and special offers' },
                        { label: 'Vesting Reminders', description: 'When tokens become available to claim' },
                        { label: 'Market Updates', description: 'Significant price movements and news' },
                        { label: 'Company Announcements', description: 'Important company updates and milestones' }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{item.label}</p>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-3">Security</h4>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <Shield className="mr-2 h-4 w-4" />
                        Enable 2-Factor Authentication
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Key className="mr-2 h-4 w-4" />
                        Export Private Key
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="mr-2 h-4 w-4" />
                        Download Transaction History
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}