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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Calculator,
  Building2,
  Container,
  Truck,
  Ship,
  Plane,
  Warehouse,
  Factory,
  Store,
  Package,
  MapPin,
  FileText,
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Coins,
  Award,
  Star,
  Users,
  Clock,
  Calendar,
  Hash,
  Link,
  ExternalLink,
  Upload,
  Download,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Key,
  Fingerprint,
  Scan,
  Camera,
  Image,
  File,
  Folder,
  Database,
  Server,
  Globe,
  Map,
  Navigation,
  Anchor,
  Home,
  Building,
  Briefcase,
  ShoppingCart,
  CreditCard,
  Wallet,
  Receipt,
  FileCheck,
  FilePlus,
  FileSearch,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Sparkles,
  Flame,
  Target,
  Trophy,
  Medal,
  Crown,
  Gem,
  Diamond,
  Gift,
  Heart,
  ThumbsUp,
  MessageSquare,
  Share2,
  Send,
  Bell,
  Settings,
  Wrench,
  Hammer,
  Cog,
  Filter,
  Search,
  ZoomIn,
  Plus,
  Minus,
  ChevronRight,
  ArrowRight,
  RefreshCw,
  RotateCw,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const RWATokenization = () => {
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [tokenizationStep, setTokenizationStep] = useState(1);
  const [assetDetails, setAssetDetails] = useState({
    name: '',
    type: '',
    location: '',
    value: '',
    description: '',
    documents: []
  });

  // Asset Categories
  const assetCategories = [
    {
      id: 'real-estate',
      name: 'Real Estate',
      icon: Building2,
      description: 'Warehouses, distribution centers, logistics hubs',
      assets: [
        {
          id: 'WH-001',
          name: 'Shanghai Distribution Center',
          type: 'Warehouse',
          location: 'Shanghai, China',
          size: '50,000 sqm',
          value: 45000000,
          tokenized: 35,
          apy: 8.5,
          status: 'operational',
          certifications: ['ISO 9001', 'TAPA FSR', 'C-TPAT'],
          tenants: 12,
          occupancy: 92
        },
        {
          id: 'DC-002',
          name: 'Dubai Logistics Hub',
          type: 'Distribution Center',
          location: 'Dubai, UAE',
          size: '75,000 sqm',
          value: 68000000,
          tokenized: 20,
          apy: 9.2,
          status: 'operational',
          certifications: ['ISO 14001', 'OHSAS 18001'],
          tenants: 18,
          occupancy: 88
        },
        {
          id: 'LP-003',
          name: 'Rotterdam Port Terminal',
          type: 'Logistics Park',
          location: 'Rotterdam, Netherlands',
          size: '120,000 sqm',
          value: 125000000,
          tokenized: 15,
          apy: 7.8,
          status: 'operational',
          certifications: ['AEO', 'ISO 28000'],
          tenants: 24,
          occupancy: 95
        }
      ]
    },
    {
      id: 'transport-fleet',
      name: 'Transport Fleet',
      icon: Truck,
      description: 'Trucks, vessels, aircraft, containers',
      assets: [
        {
          id: 'FL-001',
          name: 'European Truck Fleet',
          type: 'Truck Fleet',
          units: 250,
          value: 18750000,
          tokenized: 40,
          apy: 12.5,
          status: 'active',
          utilization: 78,
          avgAge: 3.2,
          routes: 45,
          monthlyRevenue: 2850000
        },
        {
          id: 'CS-002',
          name: 'Container Ship MV Pacific',
          type: 'Vessel',
          capacity: '8,500 TEU',
          value: 85000000,
          tokenized: 25,
          apy: 10.8,
          status: 'sailing',
          utilization: 82,
          routes: 12,
          flag: 'Singapore',
          yearBuilt: 2019
        },
        {
          id: 'AC-003',
          name: 'Air Cargo Fleet',
          type: 'Aircraft Fleet',
          units: 8,
          value: 420000000,
          tokenized: 10,
          apy: 11.2,
          status: 'active',
          utilization: 71,
          avgAge: 5.5,
          destinations: 65,
          monthlyTonnage: 12500
        }
      ]
    },
    {
      id: 'equipment',
      name: 'Equipment & Machinery',
      icon: Factory,
      description: 'Cranes, forklifts, sorting systems',
      assets: [
        {
          id: 'EQ-001',
          name: 'Automated Sorting System',
          type: 'Sorting Equipment',
          location: 'Frankfurt Hub',
          capacity: '50,000 parcels/hour',
          value: 12000000,
          tokenized: 60,
          apy: 15.2,
          status: 'operational',
          efficiency: 94,
          manufacturer: 'Siemens',
          yearInstalled: 2021
        },
        {
          id: 'CR-002',
          name: 'Port Crane Fleet',
          type: 'Container Cranes',
          units: 12,
          location: 'Los Angeles Port',
          value: 48000000,
          tokenized: 30,
          apy: 9.8,
          status: 'operational',
          movesPerHour: 35,
          availability: 96
        },
        {
          id: 'FL-003',
          name: 'Forklift Fleet',
          type: 'Material Handling',
          units: 450,
          value: 6750000,
          tokenized: 75,
          apy: 13.5,
          status: 'active',
          utilization: 85,
          avgAge: 2.8,
          locations: 15
        }
      ]
    },
    {
      id: 'containers',
      name: 'Container Assets',
      icon: Container,
      description: 'Shipping containers, reefers, tank containers',
      assets: [
        {
          id: 'CT-001',
          name: 'Standard Container Fleet',
          type: '40ft Containers',
          units: 5000,
          value: 15000000,
          tokenized: 50,
          apy: 8.2,
          status: 'deployed',
          utilization: 73,
          locations: 'Global',
          condition: 'Good'
        },
        {
          id: 'RF-002',
          name: 'Reefer Container Fleet',
          type: 'Refrigerated Containers',
          units: 800,
          value: 8000000,
          tokenized: 35,
          apy: 11.5,
          status: 'deployed',
          utilization: 81,
          tempRange: '-30°C to +30°C',
          avgAge: 4.1
        },
        {
          id: 'TC-003',
          name: 'Tank Container Fleet',
          type: 'Liquid Tank Containers',
          units: 300,
          value: 4500000,
          tokenized: 45,
          apy: 10.8,
          status: 'deployed',
          utilization: 68,
          capacity: '26,000L each',
          certifications: ['UN Portable Tank']
        }
      ]
    }
  ];

  // Tokenized Assets Market
  const tokenizedAssets = [
    {
      id: 'TOK-001',
      name: 'Singapore Mega Port Token',
      symbol: 'SGPT',
      type: 'Port Infrastructure',
      totalValue: 250000000,
      tokenSupply: 250000000,
      pricePerToken: 1.00,
      apy: 9.5,
      holders: 12845,
      tradingVolume24h: 8500000,
      priceChange24h: 2.3,
      liquidityPool: 45000000,
      stakingRewards: true
    },
    {
      id: 'TOK-002',
      name: 'Global Container Token',
      symbol: 'GCT',
      type: 'Container Fleet',
      totalValue: 85000000,
      tokenSupply: 85000000,
      pricePerToken: 1.00,
      apy: 11.2,
      holders: 8462,
      tradingVolume24h: 3200000,
      priceChange24h: -0.8,
      liquidityPool: 18000000,
      stakingRewards: true
    },
    {
      id: 'TOK-003',
      name: 'European Logistics REIT',
      symbol: 'ELR',
      type: 'Real Estate',
      totalValue: 450000000,
      tokenSupply: 45000000,
      pricePerToken: 10.00,
      apy: 7.8,
      holders: 24580,
      tradingVolume24h: 12400000,
      priceChange24h: 1.5,
      liquidityPool: 78000000,
      stakingRewards: false
    }
  ];

  // Tokenization Process Steps
  const tokenizationSteps = [
    { step: 1, name: 'Asset Selection', icon: Search, status: 'active' },
    { step: 2, name: 'Due Diligence', icon: FileSearch, status: 'pending' },
    { step: 3, name: 'Valuation', icon: Calculator, status: 'pending' },
    { step: 4, name: 'Legal Structure', icon: FileCheck, status: 'pending' },
    { step: 5, name: 'Smart Contract', icon: FileText, status: 'pending' },
    { step: 6, name: 'Token Issuance', icon: Coins, status: 'pending' },
    { step: 7, name: 'Distribution', icon: Share2, status: 'pending' }
  ];

  // Recent Transactions
  const recentTransactions = [
    {
      id: 'TX-001',
      type: 'Token Purchase',
      asset: 'SGPT',
      amount: 50000,
      price: 1.02,
      total: 51000,
      buyer: '0x742d...8c9f',
      time: '2 min ago'
    },
    {
      id: 'TX-002',
      type: 'Dividend Payout',
      asset: 'GCT',
      amount: 2500,
      recipient: '0x9f2e...4d1a',
      time: '15 min ago'
    },
    {
      id: 'TX-003',
      type: 'Token Sale',
      asset: 'ELR',
      amount: 1000,
      price: 10.15,
      total: 10150,
      seller: '0x3c1b...7e2f',
      time: '28 min ago'
    }
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
    return `$${num.toFixed(2)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
      case 'active':
      case 'deployed':
        return 'bg-green-500';
      case 'sailing':
      case 'pending':
        return 'bg-yellow-500';
      case 'maintenance':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Real World Asset Tokenization
            </h1>
            <p className="text-muted-foreground mt-2">
              Transform physical logistics assets into tradeable blockchain tokens
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Documentation
            </Button>
            <Button variant="outline">
              <Shield className="h-4 w-4 mr-2" />
              Audit Reports
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tokenize Asset
            </Button>
          </div>
        </div>

        {/* Platform Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Assets Value</p>
                  <p className="text-2xl font-bold">$2.85B</p>
                </div>
                <Building2 className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tokenized Assets</p>
                  <p className="text-2xl font-bold">147</p>
                </div>
                <Coins className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Token Holders</p>
                  <p className="text-2xl font-bold">45.8K</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg APY</p>
                  <p className="text-2xl font-bold text-green-500">10.8%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">24h Volume</p>
                  <p className="text-2xl font-bold">$24.1M</p>
                </div>
                <Activity className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="explore" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="explore">Explore Assets</TabsTrigger>
          <TabsTrigger value="tokenize">Tokenize Asset</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="portfolio">My Portfolio</TabsTrigger>
          <TabsTrigger value="governance">Governance</TabsTrigger>
        </TabsList>

        {/* Explore Assets Tab */}
        <TabsContent value="explore" className="space-y-6">
          {assetCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Card key={category.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle>{category.name}</CardTitle>
                        <CardDescription>{category.description}</CardDescription>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View All
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {category.assets.map((asset: any) => (
                      <motion.div
                        key={asset.id}
                        whileHover={{ scale: 1.02 }}
                        className="border rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer"
                        onClick={() => setSelectedAsset(asset.id)}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <Badge className={getStatusColor(asset.status)}>
                            {asset.status}
                          </Badge>
                          <span className="text-sm font-semibold">
                            {asset.tokenized}% Tokenized
                          </span>
                        </div>

                        <h4 className="font-semibold mb-2">{asset.name}</h4>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Type</span>
                            <span>{asset.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Value</span>
                            <span className="font-semibold">
                              {formatNumber(asset.value)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">APY</span>
                            <span className="text-green-500 font-semibold">
                              {asset.apy}%
                            </span>
                          </div>
                          {asset.location && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span className="text-xs">{asset.location}</span>
                            </div>
                          )}
                        </div>

                        <Progress 
                          value={asset.tokenized} 
                          className="mt-3 h-2"
                        />
                        
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" className="flex-1">
                            <Coins className="h-3 w-3 mr-1" />
                            Buy Tokens
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Tokenize Asset Tab */}
        <TabsContent value="tokenize" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Asset Tokenization Process</CardTitle>
              <CardDescription>
                Follow our structured process to tokenize your real-world assets
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Process Steps */}
              <div className="flex items-center justify-between mb-8">
                {tokenizationSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = step.step === tokenizationStep;
                  const isCompleted = step.step < tokenizationStep;
                  
                  return (
                    <React.Fragment key={step.step}>
                      <div 
                        className={cn(
                          "flex flex-col items-center cursor-pointer",
                          isActive && "scale-110"
                        )}
                        onClick={() => setTokenizationStep(step.step)}
                      >
                        <div className={cn(
                          "p-3 rounded-full mb-2",
                          isCompleted && "bg-green-500 text-white",
                          isActive && "bg-primary text-white",
                          !isCompleted && !isActive && "bg-muted"
                        )}>
                          {isCompleted ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <Icon className="h-5 w-5" />
                          )}
                        </div>
                        <span className={cn(
                          "text-xs text-center",
                          isActive && "font-semibold"
                        )}>
                          {step.name}
                        </span>
                      </div>
                      {index < tokenizationSteps.length - 1 && (
                        <div className={cn(
                          "flex-1 h-0.5 -mt-8",
                          step.step < tokenizationStep ? "bg-green-500" : "bg-muted"
                        )} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Step Content */}
              <div className="border rounded-lg p-6">
                {tokenizationStep === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Select Asset Type</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { icon: Building2, label: 'Real Estate', value: 'real-estate' },
                        { icon: Truck, label: 'Transport Fleet', value: 'transport' },
                        { icon: Factory, label: 'Equipment', value: 'equipment' },
                        { icon: Container, label: 'Containers', value: 'containers' }
                      ].map((type) => {
                        const Icon = type.icon;
                        return (
                          <div
                            key={type.value}
                            className={cn(
                              "border rounded-lg p-4 cursor-pointer hover:bg-muted/50",
                              assetDetails.type === type.value && "border-primary bg-primary/10"
                            )}
                            onClick={() => setAssetDetails({ ...assetDetails, type: type.value })}
                          >
                            <Icon className="h-8 w-8 mb-2" />
                            <p className="font-semibold">{type.label}</p>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="space-y-4 mt-6">
                      <div>
                        <Label>Asset Name</Label>
                        <Input
                          placeholder="e.g., Miami Distribution Center"
                          value={assetDetails.name}
                          onChange={(e) => setAssetDetails({ ...assetDetails, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Location</Label>
                        <Input
                          placeholder="e.g., Miami, Florida, USA"
                          value={assetDetails.location}
                          onChange={(e) => setAssetDetails({ ...assetDetails, location: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Estimated Value (USD)</Label>
                        <Input
                          type="number"
                          placeholder="e.g., 25000000"
                          value={assetDetails.value}
                          onChange={(e) => setAssetDetails({ ...assetDetails, value: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          placeholder="Provide detailed description of the asset..."
                          value={assetDetails.description}
                          onChange={(e) => setAssetDetails({ ...assetDetails, description: e.target.value })}
                          rows={4}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {tokenizationStep === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Due Diligence Requirements</h3>
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Upload all required documents for verification and compliance
                      </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-3">
                      {[
                        'Ownership Documents',
                        'Property/Asset Valuation Report',
                        'Insurance Policies',
                        'Compliance Certificates',
                        'Financial Statements',
                        'Legal Opinions'
                      ].map((doc) => (
                        <div key={doc} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                              <span>{doc}</span>
                            </div>
                            <Button size="sm" variant="outline">
                              <Upload className="h-4 w-4 mr-2" />
                              Upload
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setTokenizationStep(Math.max(1, tokenizationStep - 1))}
                    disabled={tokenizationStep === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => setTokenizationStep(Math.min(7, tokenizationStep + 1))}
                    disabled={tokenizationStep === 7}
                  >
                    Next Step
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Marketplace Tab */}
        <TabsContent value="marketplace" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {tokenizedAssets.map((asset) => (
                <Card key={asset.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold">{asset.name}</h3>
                          <Badge variant="secondary">{asset.symbol}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{asset.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">${asset.pricePerToken.toFixed(2)}</p>
                        <p className={cn(
                          "text-sm",
                          asset.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'
                        )}>
                          {asset.priceChange24h >= 0 ? '+' : ''}{asset.priceChange24h}%
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Market Cap</p>
                        <p className="font-semibold">{formatNumber(asset.totalValue)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">APY</p>
                        <p className="font-semibold text-green-500">{asset.apy}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Holders</p>
                        <p className="font-semibold">{asset.holders.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">24h Volume</p>
                        <p className="font-semibold">{formatNumber(asset.tradingVolume24h)}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Buy Tokens
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Info className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                      {asset.stakingRewards && (
                        <Button variant="outline">
                          <Coins className="h-4 w-4 mr-2" />
                          Stake
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Market Overview */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Market Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Total Market Cap</span>
                      <span className="font-semibold">$785M</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">24h Volume</span>
                      <span className="font-semibold">$24.1M</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Active Traders</span>
                      <span className="font-semibold">12,485</span>
                    </div>
                    <Progress value={62} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "p-1.5 rounded",
                          tx.type === 'Token Purchase' && "bg-green-500/10",
                          tx.type === 'Token Sale' && "bg-red-500/10",
                          tx.type === 'Dividend Payout' && "bg-blue-500/10"
                        )}>
                          {tx.type === 'Token Purchase' && <TrendingUp className="h-3 w-3 text-green-500" />}
                          {tx.type === 'Token Sale' && <TrendingDown className="h-3 w-3 text-red-500" />}
                          {tx.type === 'Dividend Payout' && <DollarSign className="h-3 w-3 text-blue-500" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{tx.asset}</p>
                          <p className="text-xs text-muted-foreground">{tx.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">
                          {tx.amount ? tx.amount.toLocaleString() : '-'}
                        </p>
                        {tx.total && (
                          <p className="text-xs text-muted-foreground">
                            ${tx.total.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
                <p className="text-muted-foreground mb-4">
                  View and manage your tokenized asset portfolio
                </p>
                <Button>
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect Wallet
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Governance Tab */}
        <TabsContent value="governance">
          <Card>
            <CardHeader>
              <CardTitle>Asset Governance</CardTitle>
              <CardDescription>
                Participate in decision-making for tokenized assets you own
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Token holders can vote on asset management decisions, dividend distributions, 
                  and strategic initiatives proportional to their holdings.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RWATokenization;