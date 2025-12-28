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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Rocket,
  TrendingUp,
  Users,
  Calendar,
  Shield,
  Star,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Info,
  Globe,
  Twitter,
  Send,
  Github,
  FileText,
  Lock,
  Unlock,
  Target,
  Award,
  Timer,
  DollarSign,
  Coins,
  BarChart3,
  PieChart,
  Link,
  ExternalLink,
  Verified,
  ShieldCheck,
  Zap,
  Crown,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  Trophy,
  Gift,
  Heart,
  MessageCircle,
  Megaphone,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Play,
  TrendingDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const TokenLaunchpad = () => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [selectedTab, setSelectedTab] = useState('active');

  // Active Projects
  const activeProjects = [
    {
      id: 'IDO001',
      name: 'LogiChain Protocol',
      symbol: 'LOGI',
      category: 'Infrastructure',
      description: 'Decentralized logistics infrastructure protocol for cross-border trade',
      stage: 'Public Sale',
      status: 'active',
      tier: 'platinum',
      allocation: 5000000,
      tokenPrice: 0.25,
      raisedAmount: 875000,
      targetAmount: 1250000,
      progress: 70,
      participants: 3456,
      minContribution: 100,
      maxContribution: 50000,
      vestingSchedule: '10% TGE, 3 months cliff, 18 months linear',
      startDate: '2025-09-01',
      endDate: '2025-09-15',
      kycRequired: true,
      whitelistRequired: false,
      teamTokens: 15,
      liquidityLock: 365,
      audit: 'CertiK',
      features: ['KYC Verified', 'Audited', 'Insurance'],
      social: {
        website: 'https://logichain.io',
        twitter: '@logichain',
        telegram: 't.me/logichain',
        github: 'github.com/logichain',
        whitepaper: 'docs.logichain.io'
      },
      tokenomics: {
        totalSupply: 100000000,
        publicSale: 20,
        team: 15,
        ecosystem: 30,
        treasury: 15,
        liquidity: 10,
        advisors: 5,
        marketing: 5
      },
      logo: '🚛'
    },
    {
      id: 'IDO002',
      name: 'SupplyNet Finance',
      symbol: 'SNF',
      category: 'DeFi',
      description: 'Supply chain financing and invoice factoring on blockchain',
      stage: 'Whitelist',
      status: 'upcoming',
      tier: 'gold',
      allocation: 3000000,
      tokenPrice: 0.15,
      raisedAmount: 0,
      targetAmount: 450000,
      progress: 0,
      participants: 1234,
      minContribution: 250,
      maxContribution: 25000,
      vestingSchedule: '20% TGE, 2 months cliff, 12 months linear',
      startDate: '2025-09-10',
      endDate: '2025-09-20',
      kycRequired: true,
      whitelistRequired: true,
      teamTokens: 18,
      liquidityLock: 180,
      audit: 'Quantstamp',
      features: ['Early Access', 'Guaranteed Allocation'],
      social: {
        website: 'https://supplynet.fi',
        twitter: '@supplynetfi',
        telegram: 't.me/supplynetfi',
        github: 'github.com/supplynetfi',
        whitepaper: 'docs.supplynet.fi'
      },
      tokenomics: {
        totalSupply: 500000000,
        publicSale: 15,
        team: 18,
        ecosystem: 35,
        treasury: 12,
        liquidity: 12,
        advisors: 4,
        marketing: 4
      },
      logo: '💰'
    },
    {
      id: 'IDO003',
      name: 'CargoTrack',
      symbol: 'CARGO',
      category: 'Tracking',
      description: 'Real-time cargo tracking with IoT and blockchain verification',
      stage: 'Private Sale',
      status: 'active',
      tier: 'silver',
      allocation: 2000000,
      tokenPrice: 0.10,
      raisedAmount: 150000,
      targetAmount: 200000,
      progress: 75,
      participants: 567,
      minContribution: 500,
      maxContribution: 15000,
      vestingSchedule: '15% TGE, 1 month cliff, 6 months linear',
      startDate: '2025-09-05',
      endDate: '2025-09-12',
      kycRequired: false,
      whitelistRequired: true,
      teamTokens: 20,
      liquidityLock: 90,
      audit: 'Hacken',
      features: ['IoT Integration', 'Enterprise Ready'],
      social: {
        website: 'https://cargotrack.io',
        twitter: '@cargotrack',
        telegram: 't.me/cargotrack',
        github: 'github.com/cargotrack',
        whitepaper: 'docs.cargotrack.io'
      },
      tokenomics: {
        totalSupply: 200000000,
        publicSale: 25,
        team: 20,
        ecosystem: 25,
        treasury: 10,
        liquidity: 15,
        advisors: 3,
        marketing: 2
      },
      logo: '📦'
    }
  ];

  // Completed Projects
  const completedProjects = [
    {
      id: 'IDO004',
      name: 'PortChain',
      symbol: 'PORT',
      category: 'Infrastructure',
      raisedAmount: 2500000,
      tokenPrice: 0.50,
      currentPrice: 2.85,
      roi: 470,
      participants: 5678,
      launchDate: '2025-06-15',
      status: 'completed',
      logo: '⚓'
    },
    {
      id: 'IDO005',
      name: 'FreightCoin',
      symbol: 'FRT',
      category: 'Payment',
      raisedAmount: 1800000,
      tokenPrice: 0.30,
      currentPrice: 1.45,
      roi: 383,
      participants: 4321,
      launchDate: '2025-07-20',
      status: 'completed',
      logo: '🚂'
    }
  ];

  // Tier Benefits
  const tierBenefits = [
    {
      tier: 'Bronze',
      requiredStake: 1000,
      allocation: 1,
      features: ['Basic Access', 'Community Support'],
      color: 'text-orange-600'
    },
    {
      tier: 'Silver',
      requiredStake: 5000,
      allocation: 2,
      features: ['Priority Access', 'Exclusive Updates', 'Discord Role'],
      color: 'text-gray-400'
    },
    {
      tier: 'Gold',
      requiredStake: 10000,
      allocation: 5,
      features: ['Guaranteed Allocation', 'Early Access', 'Private Chat'],
      color: 'text-yellow-500'
    },
    {
      tier: 'Platinum',
      requiredStake: 25000,
      allocation: 10,
      features: ['Maximum Allocation', 'Whitelist Priority', 'Direct Team Access', 'Exclusive NFT'],
      color: 'text-purple-500'
    }
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'upcoming': return 'text-blue-500';
      case 'completed': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage.toLowerCase()) {
      case 'private sale': return 'bg-purple-500';
      case 'public sale': return 'bg-green-500';
      case 'whitelist': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'bg-orange-600';
      case 'silver': return 'bg-gray-400';
      case 'gold': return 'bg-yellow-500';
      case 'platinum': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const handleContribute = () => {
    // Handle contribution logic here
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Token Launchpad
            </h1>
            <p className="text-muted-foreground mt-2">
              Participate in exclusive token launches and IDOs
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Shield className="h-4 w-4 mr-2" />
              KYC Verification
            </Button>
            <Button>
              <Rocket className="h-4 w-4 mr-2" />
              Apply to Launch
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Raised</p>
                  <p className="text-2xl font-bold">$45.8M</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active IDOs</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <Rocket className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Participants</p>
                  <p className="text-2xl font-bold">28.5K</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average ROI</p>
                  <p className="text-2xl font-bold text-green-500">+425%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active">Active IDOs</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="tiers">Tier System</TabsTrigger>
        </TabsList>

        {/* Active IDOs Tab */}
        <TabsContent value="active" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activeProjects.filter(p => p.status === 'active').map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className={cn("h-2", getStageColor(project.stage))} />
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">{project.logo}</div>
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {project.name}
                            {project.audit && (
                              <ShieldCheck className="h-4 w-4 text-green-500" />
                            )}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{project.symbol}</Badge>
                            <Badge variant="secondary">{project.category}</Badge>
                            <Badge className={getTierColor(project.tier)}>
                              {project.tier.charAt(0).toUpperCase() + project.tier.slice(1)} Tier
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Badge className={getStageColor(project.stage)}>
                        {project.stage}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {project.description}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span className="font-semibold">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-3" />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{formatNumber(project.raisedAmount)} raised</span>
                        <span>{formatNumber(project.targetAmount)} target</span>
                      </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Token Price</p>
                        <p className="font-semibold">${project.tokenPrice}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Participants</p>
                        <p className="font-semibold">{project.participants.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Min/Max</p>
                        <p className="font-semibold">
                          ${project.minContribution} - ${project.maxContribution.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-1">
                      {project.features.map((feature, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {project.kycRequired && (
                        <Badge variant="outline" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          KYC Required
                        </Badge>
                      )}
                      {project.whitelistRequired && (
                        <Badge variant="outline" className="text-xs">
                          <Lock className="h-3 w-3 mr-1" />
                          Whitelist
                        </Badge>
                      )}
                    </div>

                    {/* Time Remaining */}
                    <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Ends in 5 days 12 hours</span>
                      </div>
                      <Button size="sm" onClick={() => setSelectedProject(project.id)}>
                        Participate
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>

                    {/* Social Links */}
                    <div className="flex items-center gap-2 pt-2">
                      <Button variant="ghost" size="sm">
                        <Globe className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Twitter className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Github className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Upcoming Tab */}
        <TabsContent value="upcoming" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activeProjects.filter(p => p.status === 'upcoming').map((project) => (
              <Card key={project.id} className="overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500" />
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{project.logo}</div>
                      <div>
                        <CardTitle>{project.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{project.symbol}</Badge>
                          <Badge variant="secondary">{project.category}</Badge>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-blue-500">
                      <Clock className="h-3 w-3 mr-1" />
                      Upcoming
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {project.description}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Start Date</p>
                      <p className="font-semibold">{project.startDate}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Target Raise</p>
                      <p className="font-semibold">{formatNumber(project.targetAmount)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Token Price</p>
                      <p className="font-semibold">${project.tokenPrice}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Allocation</p>
                      <p className="font-semibold">{project.allocation.toLocaleString()} tokens</p>
                    </div>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Whitelist registration is now open. Join the whitelist to secure your allocation.
                    </AlertDescription>
                  </Alert>

                  <Button className="w-full">
                    <Star className="h-4 w-4 mr-2" />
                    Join Whitelist
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Completed Tab */}
        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed IDOs</CardTitle>
              <CardDescription>Track the performance of past launches</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {completedProjects.map((project) => (
                  <div key={project.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{project.logo}</span>
                        <div>
                          <h3 className="font-semibold">{project.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline">{project.symbol}</Badge>
                            <span>•</span>
                            <span>{project.category}</span>
                            <span>•</span>
                            <span>Launched {project.launchDate}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-2xl font-bold text-green-500">
                          <ArrowUpRight className="h-5 w-5" />
                          +{project.roi}%
                        </div>
                        <p className="text-sm text-muted-foreground">ROI</p>
                      </div>
                    </div>
                    <Separator className="my-3" />
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">IDO Price</p>
                        <p className="font-semibold">${project.tokenPrice}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Current Price</p>
                        <p className="font-semibold text-green-500">${project.currentPrice}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Raised</p>
                        <p className="font-semibold">{formatNumber(project.raisedAmount)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Participants</p>
                        <p className="font-semibold">{project.participants.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tier System Tab */}
        <TabsContent value="tiers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Launchpad Tier System</CardTitle>
              <CardDescription>
                Stake MOLOCHAIN tokens to unlock exclusive benefits and guaranteed allocations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {tierBenefits.map((tier) => (
                  <Card key={tier.tier} className="relative overflow-hidden">
                    <div className={cn("h-2", 
                      tier.tier === 'Bronze' && 'bg-orange-600',
                      tier.tier === 'Silver' && 'bg-gray-400',
                      tier.tier === 'Gold' && 'bg-yellow-500',
                      tier.tier === 'Platinum' && 'bg-purple-500'
                    )} />
                    <CardHeader>
                      <CardTitle className={cn("flex items-center gap-2", tier.color)}>
                        <Trophy className="h-5 w-5" />
                        {tier.tier}
                      </CardTitle>
                      <CardDescription>
                        Stake {tier.requiredStake.toLocaleString()} MOLOCHAIN
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Allocation Multiplier</p>
                        <p className="text-2xl font-bold">{tier.allocation}x</p>
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <p className="text-sm font-semibold">Benefits:</p>
                        {tier.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                      <Button className="w-full" variant="outline">
                        Upgrade Tier
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Alert className="mt-6">
                <Sparkles className="h-4 w-4" />
                <AlertDescription>
                  Your current tier: <strong>Gold</strong>. You have a 5x allocation multiplier and 
                  guaranteed allocation in all IDOs. Stake 15,000 more MOLOCHAIN to reach Platinum tier.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Participation Modal */}
      {selectedProject && (
        <Card className="fixed bottom-4 right-4 w-96 shadow-2xl z-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Participate in IDO
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedProject(null)}
              >
                ✕
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Contribution Amount (USDT)</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={contributionAmount}
                onChange={(e) => setContributionAmount(e.target.value)}
              />
            </div>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Token Allocation</span>
                <span className="font-semibold">
                  {contributionAmount ? (parseFloat(contributionAmount) / 0.25).toFixed(2) : '0'} LOGI
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Your Tier Bonus</span>
                <span className="font-semibold text-green-500">5x</span>
              </div>
            </div>
            <Button 
              className="w-full" 
              onClick={handleContribute}
              disabled={!contributionAmount}
            >
              Confirm Participation
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TokenLaunchpad;