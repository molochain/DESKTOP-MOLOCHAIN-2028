import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search,
  Hash,
  Blocks,
  Activity,
  Clock,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  Copy,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  DollarSign,
  Zap,
  Network,
  Database,
  FileCode,
  Shield,
  Timer,
  Cpu,
  HardDrive,
  Globe,
  Info,
  Filter,
  Calendar,
  Package,
  Wallet,
  Link as LinkIcon
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

interface Block {
  number: number;
  hash: string;
  timestamp: string;
  miner: string;
  transactions: number;
  gasUsed: number;
  gasLimit: number;
  size: number;
  reward: number;
}

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: number;
  fee: number;
  timestamp: string;
  status: 'success' | 'pending' | 'failed';
  block: number;
  type: 'transfer' | 'contract' | 'stake' | 'burn' | 'swap';
  gas: number;
}

interface Address {
  address: string;
  balance: number;
  tokens: number;
  transactions: number;
  type: 'wallet' | 'contract' | 'validator';
  lastActive: string;
}

const BlockchainExplorer = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'block' | 'tx' | 'address'>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [selectedNetwork, setSelectedNetwork] = useState('mainnet');
  const { toast } = useToast();

  // Mock data
  const latestBlocks: Block[] = [
    {
      number: 34892374,
      hash: '0x7d3e...8f2a',
      timestamp: '10 seconds ago',
      miner: '0x7abe...1a8F',
      transactions: 142,
      gasUsed: 12847293,
      gasLimit: 15000000,
      size: 45892,
      reward: 2.5
    },
    {
      number: 34892373,
      hash: '0x9c2f...3d4e',
      timestamp: '23 seconds ago',
      miner: '0x8f3a...2c1d',
      transactions: 238,
      gasUsed: 14283947,
      gasLimit: 15000000,
      size: 52847,
      reward: 2.8
    },
    {
      number: 34892372,
      hash: '0x2a8e...9f3c',
      timestamp: '36 seconds ago',
      miner: '0x3d2c...8e9f',
      transactions: 189,
      gasUsed: 11928374,
      gasLimit: 15000000,
      size: 48293,
      reward: 2.6
    },
    {
      number: 34892371,
      hash: '0x5f3d...2c8a',
      timestamp: '49 seconds ago',
      miner: '0x9e8c...3f2d',
      transactions: 203,
      gasUsed: 13928475,
      gasLimit: 15000000,
      size: 49283,
      reward: 2.7
    },
    {
      number: 34892370,
      hash: '0x8c2e...4f9a',
      timestamp: '1 minute ago',
      miner: '0x2f3e...9c8d',
      transactions: 167,
      gasUsed: 10928374,
      gasLimit: 15000000,
      size: 43829,
      reward: 2.4
    }
  ];

  const latestTransactions: Transaction[] = [
    {
      hash: '0x3f8a...2c9d',
      from: '0x742d...bEb4',
      to: '0x8f3a...2c1d',
      value: 125.5,
      fee: 0.003,
      timestamp: '5 seconds ago',
      status: 'success',
      block: 34892374,
      type: 'transfer',
      gas: 21000
    },
    {
      hash: '0x9e2f...8d3a',
      from: '0x3d2c...8e9f',
      to: '0x0000...0000',
      value: 1000,
      fee: 0.008,
      timestamp: '8 seconds ago',
      status: 'success',
      block: 34892374,
      type: 'burn',
      gas: 45000
    },
    {
      hash: '0x2c8e...9f3d',
      from: '0x9e8c...3f2d',
      to: '0xDEX...Contract',
      value: 500,
      fee: 0.012,
      timestamp: '12 seconds ago',
      status: 'pending',
      block: 0,
      type: 'swap',
      gas: 120000
    },
    {
      hash: '0x8f3c...2e9a',
      from: '0x2f3e...9c8d',
      to: '0xStake...Pool',
      value: 10000,
      fee: 0.015,
      timestamp: '15 seconds ago',
      status: 'success',
      block: 34892373,
      type: 'stake',
      gas: 85000
    },
    {
      hash: '0x4d2e...8c3f',
      from: '0x8c9f...2d3e',
      to: '0x3f2d...9e8c',
      value: 75.25,
      fee: 0.002,
      timestamp: '18 seconds ago',
      status: 'success',
      block: 34892373,
      type: 'transfer',
      gas: 21000
    }
  ];

  const topAddresses: Address[] = [
    {
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4',
      balance: 1250000,
      tokens: 125000,
      transactions: 45892,
      type: 'wallet',
      lastActive: '2 minutes ago'
    },
    {
      address: '0xDEX...Contract',
      balance: 8928374,
      tokens: 0,
      transactions: 892374,
      type: 'contract',
      lastActive: 'Active now'
    },
    {
      address: '0xStaking...Pool',
      balance: 5928374,
      tokens: 5928374,
      transactions: 238947,
      type: 'contract',
      lastActive: 'Active now'
    },
    {
      address: '0x8f3a2c1d...Validator',
      balance: 328947,
      tokens: 328947,
      transactions: 128394,
      type: 'validator',
      lastActive: '5 minutes ago'
    }
  ];

  // Network stats
  const networkStats = {
    blockHeight: 34892374,
    avgBlockTime: 3,
    totalTransactions: 892374928,
    activeAddresses: 523847,
    validators: 100,
    stakingRatio: 45.2,
    networkHashrate: '523 TH/s',
    difficulty: '8.2T',
    gasPrice: '3 Gwei',
    tps: 378
  };

  const handleSearch = () => {
    if (!searchQuery) {
      toast({
        title: "Search Query Required",
        description: "Please enter a block number, transaction hash, or address",
        variant: "destructive"
      });
      return;
    }

    // Simulate search
    toast({
      title: "Searching...",
      description: `Looking for ${searchQuery}`,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Value copied to clipboard",
    });
  };

  const formatAddress = (address: string) => {
    if (address.includes('...')) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'transfer': return <ArrowRight className="w-4 h-4" />;
      case 'contract': return <FileCode className="w-4 h-4" />;
      case 'stake': return <Shield className="w-4 h-4" />;
      case 'burn': return <ArrowDown className="w-4 h-4 text-red-500" />;
      case 'swap': return <ArrowUp className="w-4 h-4 text-blue-500" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'success':
        return <Badge className="bg-green-500/10 text-green-500">Success</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-500">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/10 text-red-500">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      // Refreshing blockchain data
    }, 10000);

    return () => clearInterval(interval);
  }, []);

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
              <Blocks className="w-3 h-3 mr-1" /> Blockchain Explorer
            </Badge>
            <h1 className="text-4xl font-bold mb-4">MOLOCHAIN Explorer</h1>
            <p className="text-muted-foreground text-lg">
              Real-time blockchain data, transaction tracking, and network analytics. 
              Explore blocks, transactions, and addresses on the MOLOCHAIN network.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <Select value={searchType} onValueChange={(value: any) => setSearchType(value)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="block">Block</SelectItem>
                  <SelectItem value="tx">Transaction</SelectItem>
                  <SelectItem value="address">Address</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by block number, transaction hash, or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch}>
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Network Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Block Height</p>
                  <p className="text-lg font-bold">{networkStats.blockHeight.toLocaleString()}</p>
                </div>
                <Blocks className="w-4 h-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">TPS</p>
                  <p className="text-lg font-bold">{networkStats.tps}</p>
                </div>
                <Zap className="w-4 h-4 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Active Addresses</p>
                  <p className="text-lg font-bold">{(networkStats.activeAddresses / 1000).toFixed(0)}K</p>
                </div>
                <Users className="w-4 h-4 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Gas Price</p>
                  <p className="text-lg font-bold">{networkStats.gasPrice}</p>
                </div>
                <Activity className="w-4 h-4 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Staking</p>
                  <p className="text-lg font-bold">{networkStats.stakingRatio}%</p>
                </div>
                <Shield className="w-4 h-4 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="blocks" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="blocks">Latest Blocks</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="addresses">Top Addresses</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Latest Blocks Tab */}
          <TabsContent value="blocks" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Latest Blocks</CardTitle>
                    <CardDescription>
                      Most recent blocks on the MOLOCHAIN network
                    </CardDescription>
                  </div>
                  <Button size="sm" variant="outline">
                    <Filter className="w-4 h-4 mr-1" />
                    Filter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Block</TableHead>
                        <TableHead>Age</TableHead>
                        <TableHead>Txns</TableHead>
                        <TableHead>Miner</TableHead>
                        <TableHead>Gas Used</TableHead>
                        <TableHead>Reward</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {latestBlocks.map((block) => (
                        <TableRow key={block.number}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {block.number.toLocaleString()}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {block.timestamp}
                          </TableCell>
                          <TableCell>
                            <TooltipProvider>
                              <UITooltip>
                                <TooltipTrigger>
                                  <span className="font-medium">{block.transactions}</span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{block.transactions} transactions in this block</p>
                                </TooltipContent>
                              </UITooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-sm">{formatAddress(block.miner)}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(block.miner)}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{(block.gasUsed / 1000000).toFixed(2)}M</p>
                              <p className="text-xs text-muted-foreground">
                                {((block.gasUsed / block.gasLimit) * 100).toFixed(0)}%
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{block.reward} MOLOCHAIN</span>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="ghost">
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Latest Transactions</CardTitle>
                    <CardDescription>
                      Real-time transaction activity on the network
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1h">1 Hour</SelectItem>
                        <SelectItem value="24h">24 Hours</SelectItem>
                        <SelectItem value="7d">7 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {latestTransactions.map((tx) => (
                    <div key={tx.hash} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                            {getTypeIcon(tx.type)}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm">{formatAddress(tx.hash)}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(tx.hash)}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                              {getStatusBadge(tx.status)}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>From {formatAddress(tx.from)}</span>
                              <ArrowRight className="w-3 h-3" />
                              <span>To {formatAddress(tx.to)}</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{tx.timestamp}</span>
                              {tx.block > 0 && (
                                <span>Block #{tx.block.toLocaleString()}</span>
                              )}
                              <span>Gas: {tx.gas.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{tx.value} MOLOCHAIN</p>
                          <p className="text-xs text-muted-foreground">Fee: {tx.fee}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Top Addresses Tab */}
          <TabsContent value="addresses" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Addresses</CardTitle>
                <CardDescription>
                  Addresses with highest balances and activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Tokens</TableHead>
                        <TableHead>Txns</TableHead>
                        <TableHead>Last Active</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topAddresses.map((addr, idx) => (
                        <TableRow key={addr.address}>
                          <TableCell>
                            <Badge variant="outline">#{idx + 1}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-sm">{formatAddress(addr.address)}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(addr.address)}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={addr.type === 'contract' ? 'secondary' : 'outline'}>
                              {addr.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {(addr.balance / 1000000).toFixed(2)}M
                          </TableCell>
                          <TableCell>
                            {addr.tokens > 0 ? `${(addr.tokens / 1000).toFixed(0)}K` : '-'}
                          </TableCell>
                          <TableCell>
                            {(addr.transactions / 1000).toFixed(0)}K
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {addr.lastActive}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Network Overview</CardTitle>
                  <CardDescription>
                    Key metrics and network health indicators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Network Hashrate</span>
                      </div>
                      <span className="font-medium">{networkStats.networkHashrate}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Difficulty</span>
                      </div>
                      <span className="font-medium">{networkStats.difficulty}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-2">
                        <Timer className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Avg Block Time</span>
                      </div>
                      <span className="font-medium">{networkStats.avgBlockTime}s</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Total Transactions</span>
                      </div>
                      <span className="font-medium">{(networkStats.totalTransactions / 1000000).toFixed(0)}M</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Validators</span>
                      </div>
                      <span className="font-medium">{networkStats.validators}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Transaction Types</CardTitle>
                  <CardDescription>
                    Distribution of transaction types on the network
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { type: 'Transfer', count: 523847, percentage: 45, color: 'bg-blue-500' },
                      { type: 'Smart Contract', count: 238947, percentage: 20, color: 'bg-purple-500' },
                      { type: 'Staking', count: 182938, percentage: 15, color: 'bg-green-500' },
                      { type: 'DeFi Swap', count: 128394, percentage: 12, color: 'bg-yellow-500' },
                      { type: 'Token Burn', count: 92847, percentage: 8, color: 'bg-red-500' }
                    ].map((item) => (
                      <div key={item.type}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{item.type}</span>
                          <span className="text-sm text-muted-foreground">
                            {(item.count / 1000).toFixed(0)}K ({item.percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`${item.color} h-2 rounded-full`}
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Network Health */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Network Health Status</CardTitle>
                  <CardDescription>
                    Real-time monitoring of network performance and stability
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="p-3 bg-green-500/10 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium">Consensus</span>
                      </div>
                      <p className="text-xs text-muted-foreground">100% Healthy</p>
                    </div>
                    <div className="p-3 bg-green-500/10 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium">Finality</span>
                      </div>
                      <p className="text-xs text-muted-foreground">2 blocks (~6s)</p>
                    </div>
                    <div className="p-3 bg-yellow-500/10 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium">Mempool</span>
                      </div>
                      <p className="text-xs text-muted-foreground">2,847 pending</p>
                    </div>
                    <div className="p-3 bg-green-500/10 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium">Fork Status</span>
                      </div>
                      <p className="text-xs text-muted-foreground">No forks detected</p>
                    </div>
                  </div>

                  <Alert className="mt-4">
                    <Info className="w-4 h-4" />
                    <AlertDescription>
                      The MOLOCHAIN network is operating normally with optimal performance metrics. 
                      All validators are online and consensus is stable.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BlockchainExplorer;