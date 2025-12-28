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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Shield,
  Package,
  Truck,
  Ship,
  Plane,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  DollarSign,
  Clock,
  Users,
  TrendingUp,
  BarChart3,
  FileText,
  Calculator,
  Lock,
  Unlock,
  Award,
  Target,
  Zap,
  Activity,
  Timer,
  Calendar,
  MapPin,
  Navigation,
  Anchor,
  Container,
  Warehouse,
  CloudRain,
  ThermometerSun,
  Wind,
  Waves,
  AlertCircle,
  Heart,
  Briefcase,
  Scale,
  Gavel,
  Building,
  Globe,
  Database,
  GitBranch,
  Layers,
  Shield as ShieldIcon,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  ShieldQuestion,
  Umbrella,
  Banknote,
  CreditCard,
  Wallet,
  Receipt,
  FileCheck,
  FileClock,
  FileX,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  Download,
  Upload,
  RefreshCw,
  Settings,
  HelpCircle,
  MessageSquare,
  Star,
  Sparkles,
  Trophy,
  Crown,
  Flame,
  Coins
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const InsuranceProtocol = () => {
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null);
  const [cargoValue, setCargoValue] = useState('50000');
  const [coverageAmount, setCoverageAmount] = useState('45000');
  const [deductible, setDeductible] = useState([10]);
  const [duration, setDuration] = useState('30');
  const [selectedCoverage, setSelectedCoverage] = useState('comprehensive');

  // Insurance Products
  const insuranceProducts = [
    {
      id: 'INS-001',
      name: 'Comprehensive Cargo Protection',
      description: 'Full coverage for all risks including damage, loss, theft, and delays',
      icon: ShieldCheck,
      premiumRate: 2.5,
      minCoverage: 10000,
      maxCoverage: 10000000,
      deductible: 10,
      coverageItems: ['Physical Damage', 'Total Loss', 'Theft', 'Delay Penalties', 'Natural Disasters'],
      exclusions: ['War', 'Nuclear', 'Intentional Damage'],
      claimTime: '48 hours',
      rating: 4.8,
      totalCovered: 125000000,
      activePolicies: 2847
    },
    {
      id: 'INS-002',
      name: 'Marine Cargo Insurance',
      description: 'Specialized coverage for ocean freight shipments',
      icon: Ship,
      premiumRate: 1.8,
      minCoverage: 25000,
      maxCoverage: 50000000,
      deductible: 15,
      coverageItems: ['Vessel Damage', 'Jettison', 'General Average', 'Piracy', 'Port Risks'],
      exclusions: ['Inherent Vice', 'Ordinary Leakage', 'Wear and Tear'],
      claimTime: '72 hours',
      rating: 4.6,
      totalCovered: 450000000,
      activePolicies: 1568
    },
    {
      id: 'INS-003',
      name: 'Air Freight Insurance',
      description: 'High-value cargo protection for air shipments',
      icon: Plane,
      premiumRate: 1.2,
      minCoverage: 5000,
      maxCoverage: 5000000,
      deductible: 5,
      coverageItems: ['Aircraft Accident', 'Loading/Unloading', 'Airport Theft', 'Customs Delays'],
      exclusions: ['Perishable Goods', 'Live Animals', 'Fragile Items without Proper Packaging'],
      claimTime: '24 hours',
      rating: 4.9,
      totalCovered: 87000000,
      activePolicies: 956
    },
    {
      id: 'INS-004',
      name: 'Temperature-Controlled Insurance',
      description: 'Coverage for refrigerated and temperature-sensitive cargo',
      icon: ThermometerSun,
      premiumRate: 3.5,
      minCoverage: 20000,
      maxCoverage: 2000000,
      deductible: 8,
      coverageItems: ['Temperature Deviation', 'Reefer Breakdown', 'Power Failure', 'Spoilage'],
      exclusions: ['Improper Packaging', 'Natural Deterioration', 'Delayed Collection'],
      claimTime: '12 hours',
      rating: 4.7,
      totalCovered: 45000000,
      activePolicies: 678
    },
    {
      id: 'INS-005',
      name: 'Last-Mile Delivery Insurance',
      description: 'Protection for final delivery stage to end customers',
      icon: Truck,
      premiumRate: 2.0,
      minCoverage: 1000,
      maxCoverage: 100000,
      deductible: 12,
      coverageItems: ['Package Theft', 'Delivery Damage', 'Wrong Delivery', 'Customer Disputes'],
      exclusions: ['Signature Fraud', 'Accessible Location Theft', 'Weather Delays'],
      claimTime: '6 hours',
      rating: 4.5,
      totalCovered: 28000000,
      activePolicies: 5847
    }
  ];

  // Active Policies
  const activePolicies = [
    {
      policyNumber: 'POL-2025-0147',
      product: 'Comprehensive Cargo Protection',
      cargoType: 'Electronics',
      value: 250000,
      premium: 6250,
      coverage: 225000,
      route: 'Shanghai → Los Angeles',
      status: 'active',
      startDate: '2025-01-15',
      endDate: '2025-02-15',
      risk: 'low'
    },
    {
      policyNumber: 'POL-2025-0089',
      product: 'Marine Cargo Insurance',
      cargoType: 'Machinery',
      value: 1500000,
      premium: 27000,
      coverage: 1275000,
      route: 'Hamburg → Singapore',
      status: 'active',
      startDate: '2025-01-10',
      endDate: '2025-03-10',
      risk: 'medium'
    },
    {
      policyNumber: 'POL-2024-0956',
      product: 'Temperature-Controlled Insurance',
      cargoType: 'Pharmaceuticals',
      value: 500000,
      premium: 17500,
      coverage: 460000,
      route: 'Mumbai → London',
      status: 'expired',
      startDate: '2024-11-01',
      endDate: '2025-01-01',
      risk: 'high'
    }
  ];

  // Claims History
  const claimsHistory = [
    {
      claimId: 'CLM-2025-0034',
      policyNumber: 'POL-2024-0789',
      type: 'Damage',
      amount: 15000,
      status: 'approved',
      submittedDate: '2025-01-05',
      approvedDate: '2025-01-07',
      paidDate: '2025-01-08'
    },
    {
      claimId: 'CLM-2025-0021',
      policyNumber: 'POL-2024-0654',
      type: 'Delay Penalty',
      amount: 8500,
      status: 'processing',
      submittedDate: '2025-01-12',
      approvedDate: null,
      paidDate: null
    },
    {
      claimId: 'CLM-2024-0198',
      policyNumber: 'POL-2024-0432',
      type: 'Total Loss',
      amount: 125000,
      status: 'approved',
      submittedDate: '2024-12-15',
      approvedDate: '2024-12-18',
      paidDate: '2024-12-20'
    },
    {
      claimId: 'CLM-2024-0156',
      policyNumber: 'POL-2024-0321',
      type: 'Theft',
      amount: 35000,
      status: 'rejected',
      submittedDate: '2024-11-20',
      approvedDate: null,
      paidDate: null
    }
  ];

  // Risk Assessment Factors
  const riskFactors = [
    { factor: 'Route Risk', score: 3.2, weight: 25, status: 'low' },
    { factor: 'Cargo Type', score: 7.8, weight: 20, status: 'high' },
    { factor: 'Carrier Rating', score: 2.1, weight: 15, status: 'low' },
    { factor: 'Weather Conditions', score: 5.4, weight: 15, status: 'medium' },
    { factor: 'Political Stability', score: 4.2, weight: 10, status: 'medium' },
    { factor: 'Historical Claims', score: 3.8, weight: 15, status: 'low' }
  ];

  // Staking Pools
  const stakingPools = [
    {
      name: 'Low Risk Pool',
      tvl: 5800000,
      apy: 12.5,
      utilizationRate: 45,
      totalClaims: 125000,
      risk: 'low'
    },
    {
      name: 'Medium Risk Pool',
      tvl: 3200000,
      apy: 18.7,
      utilizationRate: 62,
      totalClaims: 458000,
      risk: 'medium'
    },
    {
      name: 'High Risk Pool',
      tvl: 1500000,
      apy: 28.4,
      utilizationRate: 78,
      totalClaims: 897000,
      risk: 'high'
    }
  ];

  const calculatePremium = () => {
    const value = parseFloat(cargoValue) || 0;
    const coverage = parseFloat(coverageAmount) || 0;
    const days = parseInt(duration) || 30;
    const deductiblePercent = deductible[0] / 100;
    
    const basePremium = coverage * 0.025; // 2.5% base rate
    const durationMultiplier = days / 30; // Adjust for duration
    const deductibleDiscount = 1 - (deductiblePercent * 0.3); // Up to 30% discount for higher deductible
    
    return basePremium * durationMultiplier * deductibleDiscount;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
    return `$${num.toFixed(2)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'expired': return 'bg-gray-500';
      case 'processing': return 'bg-yellow-500';
      case 'approved': return 'bg-blue-500';
      case 'rejected': return 'bg-red-500';
      case 'cancelled': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const premium = calculatePremium();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              DeFi Insurance Protocol
            </h1>
            <p className="text-muted-foreground mt-2">
              Decentralized cargo insurance with instant claims and transparent pricing
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Calculator className="h-4 w-4 mr-2" />
              Premium Calculator
            </Button>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Documentation
            </Button>
            <Button>
              <Shield className="h-4 w-4 mr-2" />
              Get Coverage
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Insured</p>
                  <p className="text-2xl font-bold">$840M</p>
                </div>
                <Shield className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Policies</p>
                  <p className="text-2xl font-bold">11.8K</p>
                </div>
                <FileCheck className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Claims Paid</p>
                  <p className="text-2xl font-bold">$24.5M</p>
                </div>
                <Banknote className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Claim Time</p>
                  <p className="text-2xl font-bold">36 hrs</p>
                </div>
                <Timer className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pool TVL</p>
                  <p className="text-2xl font-bold">$10.5M</p>
                </div>
                <Database className="h-8 w-8 text-indigo-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="policies">My Policies</TabsTrigger>
          <TabsTrigger value="claims">Claims</TabsTrigger>
          <TabsTrigger value="quote">Get Quote</TabsTrigger>
          <TabsTrigger value="staking">Staking Pools</TabsTrigger>
          <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Insurance Products</CardTitle>
                  <CardDescription>Choose the right coverage for your cargo</CardDescription>
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    <SelectItem value="marine">Marine</SelectItem>
                    <SelectItem value="air">Air Freight</SelectItem>
                    <SelectItem value="land">Land Transport</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {insuranceProducts.map((product) => {
                  const Icon = product.icon;
                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => setSelectedPolicy(product.id)}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{product.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {product.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-medium">{product.rating}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Premium Rate</p>
                          <p className="text-lg font-bold text-green-500">
                            {product.premiumRate}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Deductible</p>
                          <p className="text-lg font-bold">{product.deductible}%</p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div>
                          <p className="text-sm font-medium mb-1">Coverage Includes:</p>
                          <div className="flex flex-wrap gap-1">
                            {product.coverageItems.slice(0, 3).map((item) => (
                              <Badge key={item} variant="secondary" className="text-xs">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                {item}
                              </Badge>
                            ))}
                            {product.coverageItems.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{product.coverageItems.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <Separator className="my-3" />

                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Coverage</p>
                          <p className="font-semibold">
                            {formatNumber(product.minCoverage)} - {formatNumber(product.maxCoverage)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Claim Time</p>
                          <p className="font-semibold">{product.claimTime}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Active</p>
                          <p className="font-semibold">{product.activePolicies.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="flex-1">
                          <Shield className="h-4 w-4 mr-1" />
                          Get Quote
                        </Button>
                        <Button size="sm" variant="outline">
                          <Info className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Policies Tab */}
        <TabsContent value="policies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Insurance Policies</CardTitle>
              <CardDescription>Manage your active and past policies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activePolicies.map((policy) => (
                  <div key={policy.policyNumber} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getStatusColor(policy.status)}>
                            {policy.status.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">{policy.policyNumber}</Badge>
                          <Badge variant="secondary" className={getRiskColor(policy.risk)}>
                            {policy.risk.toUpperCase()} RISK
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-lg">{policy.product}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {policy.cargoType} • {policy.route}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{formatNumber(policy.coverage)}</p>
                        <p className="text-sm text-muted-foreground">Coverage Amount</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Cargo Value</p>
                        <p className="font-semibold">{formatNumber(policy.value)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Premium Paid</p>
                        <p className="font-semibold">{formatNumber(policy.premium)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Start Date</p>
                        <p className="font-semibold">{policy.startDate}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">End Date</p>
                        <p className="font-semibold">{policy.endDate}</p>
                      </div>
                    </div>

                    {policy.status === 'active' && (
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline" className="flex-1">
                          <FileText className="h-4 w-4 mr-1" />
                          View Policy
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          File Claim
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Claims Tab */}
        <TabsContent value="claims" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Claims History</CardTitle>
                  <CardDescription>Track your insurance claims</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Claim
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {claimsHistory.map((claim) => (
                  <div key={claim.claimId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(claim.status)}>
                          {claim.status.toUpperCase()}
                        </Badge>
                        <span className="font-semibold">{claim.claimId}</span>
                        <span className="text-sm text-muted-foreground">
                          Policy: {claim.policyNumber}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">{formatNumber(claim.amount)}</p>
                        <p className="text-sm text-muted-foreground">Claim Amount</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <p className="text-muted-foreground">Type</p>
                        <p className="font-semibold">{claim.type}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Submitted</p>
                        <p className="font-semibold">{claim.submittedDate}</p>
                      </div>
                      {claim.approvedDate && (
                        <div>
                          <p className="text-muted-foreground">Approved</p>
                          <p className="font-semibold">{claim.approvedDate}</p>
                        </div>
                      )}
                      {claim.paidDate && (
                        <div>
                          <p className="text-muted-foreground">Paid</p>
                          <p className="font-semibold text-green-500">{claim.paidDate}</p>
                        </div>
                      )}
                    </div>

                    {claim.status === 'processing' && (
                      <Alert className="mt-3">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Your claim is being reviewed. Expected decision within 48 hours.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Get Quote Tab */}
        <TabsContent value="quote" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Get Insurance Quote</CardTitle>
              <CardDescription>Calculate premium for your cargo insurance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Coverage Type</Label>
                  <RadioGroup value={selectedCoverage} onValueChange={setSelectedCoverage}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="comprehensive" id="comprehensive" />
                      <Label htmlFor="comprehensive">Comprehensive (All Risks)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="named" id="named" />
                      <Label htmlFor="named">Named Perils Only</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="basic" id="basic" />
                      <Label htmlFor="basic">Basic Coverage</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Cargo Value (USD)</Label>
                    <Input
                      type="number"
                      value={cargoValue}
                      onChange={(e) => setCargoValue(e.target.value)}
                      placeholder="Enter cargo value"
                    />
                  </div>

                  <div>
                    <Label>Coverage Amount (USD)</Label>
                    <Input
                      type="number"
                      value={coverageAmount}
                      onChange={(e) => setCoverageAmount(e.target.value)}
                      placeholder="Enter coverage amount"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Transport Mode</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select transport mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ocean">Ocean Freight</SelectItem>
                    <SelectItem value="air">Air Freight</SelectItem>
                    <SelectItem value="road">Road Transport</SelectItem>
                    <SelectItem value="rail">Rail Transport</SelectItem>
                    <SelectItem value="multimodal">Multimodal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Cargo Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cargo type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Cargo</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="machinery">Machinery</SelectItem>
                    <SelectItem value="perishable">Perishable Goods</SelectItem>
                    <SelectItem value="hazardous">Hazardous Materials</SelectItem>
                    <SelectItem value="valuable">High Value Items</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Coverage Duration (Days)</Label>
                  <Input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="Enter duration"
                  />
                </div>

                <div>
                  <Label>Deductible: {deductible[0]}%</Label>
                  <Slider
                    value={deductible}
                    onValueChange={setDeductible}
                    max={25}
                    min={5}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </div>

              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Base Premium</span>
                      <span className="font-semibold">${(premium * 1.2).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Deductible Discount</span>
                      <span className="font-semibold text-green-500">
                        -${(premium * 0.2).toFixed(2)}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold">Total Premium</span>
                      <span className="font-bold text-2xl text-primary">
                        ${premium.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button className="w-full" size="lg">
                <Shield className="h-4 w-4 mr-2" />
                Purchase Insurance
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staking Pools Tab */}
        <TabsContent value="staking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Insurance Staking Pools</CardTitle>
              <CardDescription>
                Earn yield by providing liquidity to insurance pools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stakingPools.map((pool) => (
                  <Card key={pool.name}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{pool.name}</CardTitle>
                        <Badge className={cn(
                          pool.risk === 'low' && 'bg-green-500',
                          pool.risk === 'medium' && 'bg-yellow-500',
                          pool.risk === 'high' && 'bg-red-500'
                        )}>
                          {pool.risk.toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-green-500">{pool.apy}%</p>
                        <p className="text-sm text-muted-foreground">APY</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">TVL</span>
                          <span className="font-semibold">{formatNumber(pool.tvl)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Utilization</span>
                          <span className="font-semibold">{pool.utilizationRate}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total Claims</span>
                          <span className="font-semibold">{formatNumber(pool.totalClaims)}</span>
                        </div>
                      </div>

                      <Progress value={pool.utilizationRate} className="h-2" />

                      <Button className="w-full" size="sm">
                        <Coins className="h-4 w-4 mr-1" />
                        Stake USDT
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Alert className="mt-4">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Staking in insurance pools earns yield from premiums. Higher risk pools 
                  offer higher APY but have more claim exposure. Funds may be locked during 
                  active claim periods.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Assessment Tab */}
        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment</CardTitle>
              <CardDescription>AI-powered risk analysis for your shipment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskFactors.map((factor) => (
                  <div key={factor.factor} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{factor.factor}</span>
                        <Badge variant="outline" className={getRiskColor(factor.status)}>
                          {factor.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          Weight: {factor.weight}%
                        </span>
                        <span className="font-semibold">{factor.score}/10</span>
                      </div>
                    </div>
                    <Progress 
                      value={factor.score * 10} 
                      className={cn(
                        "h-2",
                        factor.status === 'low' && "[&>div]:bg-green-500",
                        factor.status === 'medium' && "[&>div]:bg-yellow-500",
                        factor.status === 'high' && "[&>div]:bg-red-500"
                      )}
                    />
                  </div>
                ))}

                <Separator className="my-4" />

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Overall Risk Score</p>
                    <p className="text-2xl font-bold">4.2/10</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Risk Level</p>
                    <p className="text-2xl font-bold text-yellow-500">MEDIUM</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Recommended Coverage</p>
                    <p className="text-2xl font-bold">90%</p>
                  </div>
                </div>

                <Alert>
                  <ShieldAlert className="h-4 w-4" />
                  <AlertDescription>
                    Based on the risk assessment, we recommend comprehensive coverage with 
                    a 10% deductible. Consider adding weather and political risk riders.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Add missing Plus icon
const Plus = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

export default InsuranceProtocol;