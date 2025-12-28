import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Vote,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  FileText,
  Shield,
  Gavel,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Calendar,
  BarChart3,
  Hash,
  User,
  Target,
  Zap,
  Info,
  ChevronRight,
  ExternalLink,
  Timer
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Proposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  proposerTokens: number;
  status: 'active' | 'passed' | 'rejected' | 'pending' | 'executed';
  type: 'protocol' | 'treasury' | 'parameter' | 'community';
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  quorum: number;
  requiredQuorum: number;
  startDate: Date;
  endDate: Date;
  executionDate?: Date;
  ipfsHash: string;
  discussions: number;
}

const Governance = () => {
  const { toast } = useToast();
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null);
  const [selectedVote, setSelectedVote] = useState<string>('');
  const [userVotingPower] = useState(45000); // Example voting power
  const [delegatedTo, setDelegatedTo] = useState<string | null>(null);

  const proposals: Proposal[] = [
    {
      id: 'MOL-001',
      title: 'Increase Staking Rewards APY',
      description: 'Proposal to increase base staking rewards from 18.5% to 22% APY to incentivize long-term holding',
      proposer: '0x742d...bE8b',
      proposerTokens: 150000,
      status: 'active',
      type: 'parameter',
      votesFor: 2847392,
      votesAgainst: 573829,
      votesAbstain: 128493,
      quorum: 3549714,
      requiredQuorum: 5000000,
      startDate: new Date('2024-12-01'),
      endDate: new Date('2024-12-08'),
      ipfsHash: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
      discussions: 47
    },
    {
      id: 'MOL-002',
      title: 'Treasury Allocation for Marketing Campaign',
      description: 'Allocate 500,000 MOLOCHAIN tokens from treasury for Q1 2025 global marketing initiatives',
      proposer: '0x8B3c...bE9c',
      proposerTokens: 89000,
      status: 'active',
      type: 'treasury',
      votesFor: 1923847,
      votesAgainst: 892374,
      votesAbstain: 234892,
      quorum: 3051113,
      requiredQuorum: 5000000,
      startDate: new Date('2024-12-03'),
      endDate: new Date('2024-12-10'),
      ipfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
      discussions: 23
    },
    {
      id: 'MOL-003',
      title: 'Implement Buyback and Burn Program',
      description: 'Use 10% of platform fees to buyback and burn MOLOCHAIN tokens quarterly',
      proposer: '0x9C4d...cF0d',
      proposerTokens: 234000,
      status: 'passed',
      type: 'protocol',
      votesFor: 4892374,
      votesAgainst: 234829,
      votesAbstain: 93847,
      quorum: 5221050,
      requiredQuorum: 5000000,
      startDate: new Date('2024-11-20'),
      endDate: new Date('2024-11-27'),
      executionDate: new Date('2024-11-28'),
      ipfsHash: 'QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewcBvGSriRHjZf',
      discussions: 89
    },
    {
      id: 'MOL-004',
      title: 'Add Support for Polygon Network',
      description: 'Deploy MOLOCHAIN smart contracts on Polygon for lower transaction fees',
      proposer: '0xA5e6...dG1e',
      proposerTokens: 67000,
      status: 'rejected',
      type: 'protocol',
      votesFor: 1283749,
      votesAgainst: 3928374,
      votesAbstain: 483928,
      quorum: 5696051,
      requiredQuorum: 5000000,
      startDate: new Date('2024-11-10'),
      endDate: new Date('2024-11-17'),
      ipfsHash: 'QmS4ustL54uo8FzR9455qaxZwuMiUhyvMcX9Ba8nUH4uVv',
      discussions: 156
    },
    {
      id: 'MOL-005',
      title: 'Community Grant Program Launch',
      description: 'Establish a 1M MOLOCHAIN grant program for developers building on our platform',
      proposer: '0xB6f7...eH2f',
      proposerTokens: 412000,
      status: 'pending',
      type: 'community',
      votesFor: 0,
      votesAgainst: 0,
      votesAbstain: 0,
      quorum: 0,
      requiredQuorum: 5000000,
      startDate: new Date('2024-12-15'),
      endDate: new Date('2024-12-22'),
      ipfsHash: 'QmYA2fn8cMbVWo4v95RwcwJVyQsNtnEwgGXhQoxBvQ3Ntm',
      discussions: 12
    }
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-blue-500/10 text-blue-500';
      case 'passed': return 'bg-green-500/10 text-green-500';
      case 'rejected': return 'bg-red-500/10 text-red-500';
      case 'pending': return 'bg-yellow-500/10 text-yellow-500';
      case 'executed': return 'bg-purple-500/10 text-purple-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'protocol': return <Shield className="w-4 h-4" />;
      case 'treasury': return <TrendingUp className="w-4 h-4" />;
      case 'parameter': return <Target className="w-4 h-4" />;
      case 'community': return <Users className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const handleVote = () => {
    if (!selectedProposal || !selectedVote) {
      toast({
        title: "Missing Information",
        description: "Please select a proposal and vote option",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Vote Submitted",
      description: `Your vote has been recorded with ${userVotingPower.toLocaleString()} voting power`,
    });
    setSelectedVote('');
  };

  const handleDelegate = (address: string) => {
    setDelegatedTo(address);
    toast({
      title: "Delegation Successful",
      description: `Delegated ${userVotingPower.toLocaleString()} voting power to ${address.slice(0, 6)}...${address.slice(-4)}`,
    });
  };

  const calculateTimeLeft = (endDate: Date) => {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diff < 0) return 'Ended';
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <Badge className="mb-4" variant="outline">
              <Gavel className="w-3 h-3 mr-1" /> DAO Governance
            </Badge>
            <h1 className="text-4xl font-bold mb-4">Governance Portal</h1>
            <p className="text-muted-foreground text-lg">
              Participate in MOLOCHAIN's decentralized governance. Vote on proposals, 
              delegate voting power, and shape the future of the protocol.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Your Voting Power</p>
                  <p className="text-2xl font-bold">{userVotingPower.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">MOLOCHAIN</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Vote className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Proposals</p>
                  <p className="text-2xl font-bold">2</p>
                  <p className="text-xs text-green-500">Vote now</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Voters</p>
                  <p className="text-2xl font-bold">8,473</p>
                  <p className="text-xs text-muted-foreground">This epoch</p>
                </div>
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Proposals Passed</p>
                  <p className="text-2xl font-bold">87%</p>
                  <p className="text-xs text-muted-foreground">Success rate</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Proposals List */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="passed">Passed</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6 space-y-4">
                {proposals.map((proposal) => (
                  <motion.div
                    key={proposal.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all ${
                        selectedProposal === proposal.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedProposal(proposal.id)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">
                                {proposal.id}
                              </Badge>
                              <Badge className={getStatusColor(proposal.status)} variant="secondary">
                                {proposal.status}
                              </Badge>
                              <Badge variant="secondary" className="flex items-center gap-1">
                                {getTypeIcon(proposal.type)}
                                {proposal.type}
                              </Badge>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">{proposal.title}</h3>
                            <p className="text-sm text-muted-foreground mb-3">
                              {proposal.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                <span>
                                  {proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                <span>{proposal.discussions} comments</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Timer className="w-3 h-3" />
                                <span>{calculateTimeLeft(proposal.endDate)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Voting Progress */}
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Quorum Progress</span>
                            <span className="font-medium">
                              {((proposal.quorum / proposal.requiredQuorum) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <Progress 
                            value={(proposal.quorum / proposal.requiredQuorum) * 100} 
                            className="h-2"
                          />
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="p-2 bg-green-500/10 rounded">
                              <div className="flex items-center justify-between">
                                <span className="text-green-600">For</span>
                                <ThumbsUp className="w-3 h-3 text-green-600" />
                              </div>
                              <p className="font-semibold">
                                {(proposal.votesFor / 1000000).toFixed(1)}M
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {((proposal.votesFor / proposal.quorum) * 100).toFixed(1)}%
                              </p>
                            </div>
                            <div className="p-2 bg-red-500/10 rounded">
                              <div className="flex items-center justify-between">
                                <span className="text-red-600">Against</span>
                                <ThumbsDown className="w-3 h-3 text-red-600" />
                              </div>
                              <p className="font-semibold">
                                {(proposal.votesAgainst / 1000000).toFixed(1)}M
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {((proposal.votesAgainst / proposal.quorum) * 100).toFixed(1)}%
                              </p>
                            </div>
                            <div className="p-2 bg-gray-500/10 rounded">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Abstain</span>
                                <AlertCircle className="w-3 h-3 text-gray-600" />
                              </div>
                              <p className="font-semibold">
                                {(proposal.votesAbstain / 1000000).toFixed(1)}M
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {((proposal.votesAbstain / proposal.quorum) * 100).toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        </div>

                        {proposal.status === 'active' && (
                          <div className="mt-4 flex gap-2">
                            <Button size="sm" className="flex-1">
                              Vote Now
                            </Button>
                            <Button size="sm" variant="outline">
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View Details
                            </Button>
                          </div>
                        )}

                        {proposal.status === 'executed' && proposal.executionDate && (
                          <div className="mt-4 p-2 bg-purple-500/10 rounded flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-purple-500" />
                            <span className="text-sm">
                              Executed on {proposal.executionDate.toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </TabsContent>

              {['active', 'passed', 'pending'].map((status) => (
                <TabsContent key={status} value={status} className="mt-6 space-y-4">
                  {proposals.filter(p => p.status === status).map((proposal) => (
                    <Card key={proposal.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{proposal.title}</h3>
                          <Badge className={getStatusColor(proposal.status)} variant="secondary">
                            {proposal.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {proposal.description}
                        </p>
                        <Progress 
                          value={(proposal.quorum / proposal.requiredQuorum) * 100} 
                          className="h-2"
                        />
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Voting Panel */}
          <div className="space-y-6">
            {/* Cast Vote */}
            {selectedProposal && proposals.find(p => p.id === selectedProposal)?.status === 'active' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Vote className="w-5 h-5" />
                    Cast Your Vote
                  </CardTitle>
                  <CardDescription>
                    Proposal {selectedProposal}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={selectedVote} onValueChange={setSelectedVote}>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                        <RadioGroupItem value="for" id="for" />
                        <Label htmlFor="for" className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <span>Vote For</span>
                            <ThumbsUp className="w-4 h-4 text-green-500" />
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                        <RadioGroupItem value="against" id="against" />
                        <Label htmlFor="against" className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <span>Vote Against</span>
                            <ThumbsDown className="w-4 h-4 text-red-500" />
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                        <RadioGroupItem value="abstain" id="abstain" />
                        <Label htmlFor="abstain" className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <span>Abstain</span>
                            <AlertCircle className="w-4 h-4 text-gray-500" />
                          </div>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>

                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Voting Power</span>
                      <span className="font-medium">{userVotingPower.toLocaleString()} MOLOCHAIN</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full mt-4" 
                    size="lg"
                    onClick={handleVote}
                    disabled={!selectedVote}
                  >
                    Submit Vote
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Delegation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Delegation
                </CardTitle>
                <CardDescription>
                  Delegate your voting power to a trusted address
                </CardDescription>
              </CardHeader>
              <CardContent>
                {delegatedTo ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Currently delegated to</p>
                      <p className="font-mono text-sm">
                        {delegatedTo.slice(0, 10)}...{delegatedTo.slice(-8)}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setDelegatedTo(null)}
                    >
                      Remove Delegation
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Top delegates by voting power:
                    </p>
                    {[
                      { address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bE8b', power: 523847, votes: 47 },
                      { address: '0x8B3c44Dd5634C0532925a3b844Bc9e7595f0bE9c', power: 412839, votes: 38 },
                      { address: '0x9C4d55Ee6745D1643036b4a955Cd0f8706g1cF0d', power: 298374, votes: 29 }
                    ].map((delegate, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{idx + 1}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-xs font-mono">
                              {delegate.address.slice(0, 6)}...{delegate.address.slice(-4)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {delegate.votes} votes cast
                            </p>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDelegate(delegate.address)}
                        >
                          Delegate
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Governance Info */}
            <Card className="bg-gradient-to-r from-blue-500/5 to-purple-500/5 border-blue-500/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm mb-1">How Governance Works</p>
                    <p className="text-xs text-muted-foreground">
                      Token holders can vote on proposals or delegate their voting power. 
                      Proposals need to meet quorum requirements and pass with majority support. 
                      Executed proposals are automatically implemented on-chain.
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

export default Governance;