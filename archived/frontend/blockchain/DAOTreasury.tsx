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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Vote,
  Wallet,
  Users,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  FileText,
  DollarSign,
  Send,
  Lock,
  Unlock,
  Award,
  Target,
  Briefcase,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  Timer,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Coins,
  UserCheck,
  UserX,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  GitBranch,
  Package,
  Gavel,
  Scale,
  Building,
  Rocket,
  Sparkles,
  Trophy,
  Crown,
  Star,
  Heart,
  Flag,
  Megaphone,
  AlertTriangle,
  RefreshCw,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const DAOTreasury = () => {
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null);
  const [voteChoice, setVoteChoice] = useState<string>('');
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalDescription, setProposalDescription] = useState('');
  const [proposalAmount, setProposalAmount] = useState('');

  // Treasury Overview
  const treasuryStats = {
    totalValue: 12500000,
    liquidAssets: 8500000,
    stakedAssets: 3000000,
    pendingRevenue: 1000000,
    monthlyBurn: 250000,
    circulatingSupply: 850000000,
    totalSupply: 1000000000,
    holders: 45678,
    avgHoldingTime: '4.2 months'
  };

  // Asset Allocation
  const treasuryAssets = [
    { asset: 'MOLOCHAIN', amount: 5000000, value: 6500000, percentage: 52 },
    { asset: 'USDT', amount: 2500000, value: 2500000, percentage: 20 },
    { asset: 'ETH', amount: 500, value: 1500000, percentage: 12 },
    { asset: 'BTC', amount: 25, value: 1000000, percentage: 8 },
    { asset: 'MATIC', amount: 500000, value: 500000, percentage: 4 },
    { asset: 'Other', amount: 0, value: 500000, percentage: 4 }
  ];

  // Active Proposals
  const proposals = [
    {
      id: 'PROP-001',
      title: 'Increase Staking Rewards to 25% APY',
      description: 'Proposal to increase staking rewards from 20% to 25% APY to incentivize long-term holding',
      proposer: '0x742d...35C9',
      category: 'Tokenomics',
      status: 'active',
      votesFor: 125847,
      votesAgainst: 45238,
      quorum: 180000,
      endTime: '2 days',
      requestedAmount: 0,
      executionDelay: 48,
      tags: ['Staking', 'Rewards', 'APY']
    },
    {
      id: 'PROP-002',
      title: 'Fund Development of Cross-Chain Bridge V2',
      description: 'Allocate 500,000 USDT for developing enhanced cross-chain bridge with 10+ network support',
      proposer: '0x8B3a...7E5F',
      category: 'Development',
      status: 'active',
      votesFor: 89542,
      votesAgainst: 12458,
      quorum: 150000,
      endTime: '5 days',
      requestedAmount: 500000,
      executionDelay: 72,
      tags: ['Development', 'Infrastructure', 'Cross-chain']
    },
    {
      id: 'PROP-003',
      title: 'Marketing Campaign for Asian Markets',
      description: 'Launch comprehensive marketing campaign targeting logistics companies in Asian markets',
      proposer: '0x5C2d...9A1B',
      category: 'Marketing',
      status: 'active',
      votesFor: 156234,
      votesAgainst: 78965,
      quorum: 250000,
      endTime: '12 hours',
      requestedAmount: 250000,
      executionDelay: 24,
      tags: ['Marketing', 'Expansion', 'Asia']
    },
    {
      id: 'PROP-004',
      title: 'Burn 10M MOLOCHAIN Tokens',
      description: 'Quarterly token burn to reduce supply and increase scarcity',
      proposer: '0x9F4e...2D8C',
      category: 'Tokenomics',
      status: 'passed',
      votesFor: 458796,
      votesAgainst: 25847,
      quorum: 400000,
      endTime: 'Passed',
      requestedAmount: 0,
      executionDelay: 0,
      tags: ['Burn', 'Supply', 'Deflation']
    },
    {
      id: 'PROP-005',
      title: 'Partnership with Global Shipping Alliance',
      description: 'Form strategic partnership with top 5 global shipping companies',
      proposer: '0x3A7b...6E9D',
      category: 'Partnership',
      status: 'pending',
      votesFor: 0,
      votesAgainst: 0,
      quorum: 200000,
      endTime: 'Starts in 2 days',
      requestedAmount: 1000000,
      executionDelay: 96,
      tags: ['Partnership', 'Enterprise', 'Logistics']
    }
  ];

  // Voting Power Distribution
  const votingPowerTiers = [
    { tier: 'Whale', minTokens: 1000000, holders: 45, votingPower: 35, color: 'text-purple-500' },
    { tier: 'Shark', minTokens: 100000, holders: 234, votingPower: 25, color: 'text-blue-500' },
    { tier: 'Dolphin', minTokens: 10000, holders: 1847, votingPower: 20, color: 'text-cyan-500' },
    { tier: 'Fish', minTokens: 1000, holders: 8965, votingPower: 15, color: 'text-green-500' },
    { tier: 'Shrimp', minTokens: 100, holders: 34587, votingPower: 5, color: 'text-yellow-500' }
  ];

  // Treasury Transactions
  const recentTransactions = [
    {
      id: 'TX-001',
      type: 'outgoing',
      description: 'Development team payment',
      amount: 150000,
      token: 'USDT',
      date: '2 hours ago',
      txHash: '0xabc...def'
    },
    {
      id: 'TX-002',
      type: 'incoming',
      description: 'Protocol fees collection',
      amount: 45000,
      token: 'MOLOCHAIN',
      date: '5 hours ago',
      txHash: '0x123...456'
    },
    {
      id: 'TX-003',
      type: 'outgoing',
      description: 'Marketing campaign expense',
      amount: 25000,
      token: 'USDT',
      date: '1 day ago',
      txHash: '0x789...012'
    },
    {
      id: 'TX-004',
      type: 'incoming',
      description: 'Staking rewards distribution',
      amount: 125000,
      token: 'MOLOCHAIN',
      date: '2 days ago',
      txHash: '0x345...678'
    }
  ];

  // Council Members
  const councilMembers = [
    { address: '0x742d...35C9', role: 'Lead Developer', votes: 125847, proposals: 12 },
    { address: '0x8B3a...7E5F', role: 'Operations', votes: 89654, proposals: 8 },
    { address: '0x5C2d...9A1B', role: 'Marketing', votes: 78456, proposals: 6 },
    { address: '0x9F4e...2D8C', role: 'Finance', votes: 95478, proposals: 15 },
    { address: '0x3A7b...6E9D', role: 'Community', votes: 68547, proposals: 10 }
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(2)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
    return num.toString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'passed': return 'bg-blue-500';
      case 'rejected': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const calculateVotePercentage = (votesFor: number, votesAgainst: number) => {
    const total = votesFor + votesAgainst;
    if (total === 0) return 0;
    return (votesFor / total) * 100;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              DAO Treasury
            </h1>
            <p className="text-muted-foreground mt-2">
              Decentralized governance and treasury management for MoloChain ecosystem
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Constitution
            </Button>
            <Button variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Council
            </Button>
            <Button>
              <Vote className="h-4 w-4 mr-2" />
              Create Proposal
            </Button>
          </div>
        </div>

        {/* Treasury Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Treasury Value</p>
                  <p className="text-2xl font-bold">${formatNumber(treasuryStats.totalValue)}</p>
                </div>
                <Briefcase className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Liquid Assets</p>
                  <p className="text-2xl font-bold">${formatNumber(treasuryStats.liquidAssets)}</p>
                </div>
                <Wallet className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Proposals</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <Vote className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Token Holders</p>
                  <p className="text-2xl font-bold">{formatNumber(treasuryStats.holders)}</p>
                </div>
                <Users className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Burn</p>
                  <p className="text-2xl font-bold">${formatNumber(treasuryStats.monthlyBurn)}</p>
                </div>
                <Trophy className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="proposals" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="proposals">Proposals</TabsTrigger>
          <TabsTrigger value="treasury">Treasury</TabsTrigger>
          <TabsTrigger value="voting">Voting Power</TabsTrigger>
          <TabsTrigger value="council">Council</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="create">Create Proposal</TabsTrigger>
        </TabsList>

        {/* Proposals Tab */}
        <TabsContent value="proposals" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Governance Proposals</CardTitle>
                  <CardDescription>Vote on proposals to shape the future of MoloChain</CardDescription>
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="passed">Passed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {proposals.map((proposal) => (
                <motion.div
                  key={proposal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedProposal(proposal.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getStatusColor(proposal.status)}>
                          {proposal.status.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">{proposal.category}</Badge>
                        <Badge variant="secondary">{proposal.id}</Badge>
                      </div>
                      <h3 className="text-lg font-semibold mb-1">{proposal.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{proposal.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Proposer: {proposal.proposer}</span>
                        {proposal.requestedAmount > 0 && (
                          <span>Request: ${formatNumber(proposal.requestedAmount)}</span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {proposal.endTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Voting Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <ThumbsUp className="h-4 w-4 text-green-500" />
                        <span className="text-green-500 font-semibold">
                          For: {formatNumber(proposal.votesFor)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-red-500 font-semibold">
                          Against: {formatNumber(proposal.votesAgainst)}
                        </span>
                        <ThumbsDown className="h-4 w-4 text-red-500" />
                      </div>
                    </div>
                    <div className="relative">
                      <Progress 
                        value={calculateVotePercentage(proposal.votesFor, proposal.votesAgainst)} 
                        className="h-3"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-semibold text-white">
                          {calculateVotePercentage(proposal.votesFor, proposal.votesAgainst).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Quorum: {formatNumber(proposal.quorum)} votes needed</span>
                      <span>
                        Total: {formatNumber(proposal.votesFor + proposal.votesAgainst)} votes
                      </span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {proposal.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Vote Buttons */}
                  {proposal.status === 'active' && (
                    <div className="flex items-center gap-2 mt-4">
                      <Button size="sm" className="flex-1" variant="outline">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Vote For
                      </Button>
                      <Button size="sm" className="flex-1" variant="outline">
                        <ThumbsDown className="h-4 w-4 mr-1" />
                        Vote Against
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Discuss
                      </Button>
                    </div>
                  )}
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Treasury Tab */}
        <TabsContent value="treasury" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Asset Allocation</CardTitle>
                <CardDescription>Current treasury holdings and distribution</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {treasuryAssets.map((asset) => (
                  <div key={asset.asset} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Coins className="h-4 w-4 text-yellow-500" />
                        <span className="font-semibold">{asset.asset}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${formatNumber(asset.value)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatNumber(asset.amount)} tokens
                        </p>
                      </div>
                    </div>
                    <Progress value={asset.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Treasury Metrics</CardTitle>
                <CardDescription>Key financial indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Circulating Supply</p>
                    <p className="text-lg font-semibold">
                      {formatNumber(treasuryStats.circulatingSupply)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Supply</p>
                    <p className="text-lg font-semibold">
                      {formatNumber(treasuryStats.totalSupply)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Holding Time</p>
                    <p className="text-lg font-semibold">{treasuryStats.avgHoldingTime}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Revenue</p>
                    <p className="text-lg font-semibold text-green-500">
                      ${formatNumber(treasuryStats.pendingRevenue)}
                    </p>
                  </div>
                </div>

                <Separator />

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Treasury is secured by multi-signature wallet requiring 4/7 council member 
                    signatures for any transaction above $100,000.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-2">
                  <Button className="flex-1">
                    <BarChart3 className="h-4 w-4 mr-1" />
                    Full Report
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-1" />
                    Export Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Voting Power Tab */}
        <TabsContent value="voting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Voting Power Distribution</CardTitle>
              <CardDescription>Token holder tiers and their influence</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {votingPowerTiers.map((tier) => (
                  <div key={tier.tier} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Crown className={cn("h-8 w-8", tier.color)} />
                      <div>
                        <h3 className="font-semibold text-lg">{tier.tier}</h3>
                        <p className="text-sm text-muted-foreground">
                          Min. {formatNumber(tier.minTokens)} MOLOCHAIN
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{tier.holders}</p>
                        <p className="text-sm text-muted-foreground">Holders</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{tier.votingPower}%</p>
                        <p className="text-sm text-muted-foreground">Voting Power</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Alert className="mt-4">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Voting power is determined by token holdings and staking duration. 
                  Long-term stakers receive up to 2x voting multiplier.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Council Tab */}
        <TabsContent value="council" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>DAO Council Members</CardTitle>
              <CardDescription>Elected representatives managing the treasury</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {councilMembers.map((member) => (
                  <div key={member.address} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{member.address.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{member.address}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="font-semibold">{formatNumber(member.votes)}</p>
                        <p className="text-sm text-muted-foreground">Total Votes</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">{member.proposals}</p>
                        <p className="text-sm text-muted-foreground">Proposals</p>
                      </div>
                      <Button size="sm" variant="outline">
                        <UserCheck className="h-4 w-4 mr-1" />
                        Delegate
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Treasury Transactions</CardTitle>
                  <CardDescription>Recent treasury inflows and outflows</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View on Explorer
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {tx.type === 'incoming' ? (
                        <ArrowDownRight className="h-5 w-5 text-green-500" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5 text-red-500" />
                      )}
                      <div>
                        <p className="font-semibold">{tx.description}</p>
                        <p className="text-sm text-muted-foreground">{tx.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "font-semibold",
                        tx.type === 'incoming' ? 'text-green-500' : 'text-red-500'
                      )}>
                        {tx.type === 'incoming' ? '+' : '-'}{formatNumber(tx.amount)} {tx.token}
                      </p>
                      <p className="text-sm text-muted-foreground">{tx.txHash}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create Proposal Tab */}
        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Proposal</CardTitle>
              <CardDescription>Submit a proposal for community voting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Proposal Title</Label>
                <Input
                  value={proposalTitle}
                  onChange={(e) => setProposalTitle(e.target.value)}
                  placeholder="Enter a clear, concise title"
                />
              </div>

              <div>
                <Label>Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tokenomics">Tokenomics</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                    <SelectItem value="governance">Governance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={proposalDescription}
                  onChange={(e) => setProposalDescription(e.target.value)}
                  placeholder="Provide detailed description of your proposal"
                  rows={6}
                />
              </div>

              <div>
                <Label>Requested Amount (Optional)</Label>
                <Input
                  type="number"
                  value={proposalAmount}
                  onChange={(e) => setProposalAmount(e.target.value)}
                  placeholder="Amount in USDT"
                />
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Creating a proposal requires holding at least 10,000 MOLOCHAIN tokens 
                  and costs 100 MOLOCHAIN as spam prevention.
                </AlertDescription>
              </Alert>

              <Button className="w-full" size="lg">
                <Vote className="h-4 w-4 mr-2" />
                Submit Proposal
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DAOTreasury;