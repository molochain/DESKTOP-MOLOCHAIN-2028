import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import {
  FileCode,
  Upload,
  Play,
  Shield,
  Settings,
  Copy,
  CheckCircle,
  AlertCircle,
  Package,
  GitBranch,
  Terminal,
  Code,
  Database,
  Zap,
  Lock,
  Unlock,
  TrendingUp,
  Layers,
  Eye,
  Edit,
  Download,
  RefreshCw,
  Plus,
  Server,
  Activity,
  Hash,
  Clock,
  DollarSign,
  Users,
  FileText,
  Search,
  Filter,
  Archive,
  ChevronRight
} from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SmartContract {
  id: string;
  name: string;
  address: string;
  type: 'ERC20' | 'ERC721' | 'ERC1155' | 'Custom' | 'DeFi' | 'Governance';
  status: 'deployed' | 'pending' | 'failed' | 'auditing';
  version: string;
  deployedAt: string;
  gasUsed: number;
  transactions: number;
  balance: number;
  audited: boolean;
  upgradeable: boolean;
}

interface ContractTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  popularity: number;
  gasEstimate: number;
  audited: boolean;
  code?: string;
}

const SmartContractsManager = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [contractCode, setContractCode] = useState('');
  const [contractName, setContractName] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState('mainnet');
  const [compileStatus, setCompileStatus] = useState<'idle' | 'compiling' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  // Mock data
  const deployedContracts: SmartContract[] = [
    {
      id: '1',
      name: 'MOLOCHAIN Token',
      address: '0x7abe4dB700cfAA83286272FDEc7299E084631a8F',
      type: 'ERC20',
      status: 'deployed',
      version: '2.1.0',
      deployedAt: '2024-03-15',
      gasUsed: 2847293,
      transactions: 458293,
      balance: 1250000,
      audited: true,
      upgradeable: true
    },
    {
      id: '2',
      name: 'Logistics NFT Collection',
      address: '0x8f3a2c1d...9e8c3f2d',
      type: 'ERC721',
      status: 'deployed',
      version: '1.0.0',
      deployedAt: '2024-06-20',
      gasUsed: 3928374,
      transactions: 12847,
      balance: 328947,
      audited: true,
      upgradeable: false
    },
    {
      id: '3',
      name: 'Staking Pool',
      address: '0x3d2c8e9f...2f3e9c8d',
      type: 'DeFi',
      status: 'deployed',
      version: '3.0.2',
      deployedAt: '2024-08-10',
      gasUsed: 4928374,
      transactions: 89234,
      balance: 5928374,
      audited: true,
      upgradeable: true
    },
    {
      id: '4',
      name: 'Governance Module',
      address: '0x9e8c3f2d...8f3a2c1d',
      type: 'Governance',
      status: 'auditing',
      version: '1.0.0-beta',
      deployedAt: '2024-11-01',
      gasUsed: 2384729,
      transactions: 0,
      balance: 0,
      audited: false,
      upgradeable: true
    }
  ];

  const contractTemplates: ContractTemplate[] = [
    {
      id: '1',
      name: 'ERC20 Token',
      category: 'Token',
      description: 'Standard fungible token contract with mint and burn capabilities',
      popularity: 95,
      gasEstimate: 2500000,
      audited: true
    },
    {
      id: '2',
      name: 'NFT Collection',
      category: 'NFT',
      description: 'ERC721 NFT contract with royalties and metadata',
      popularity: 88,
      gasEstimate: 3800000,
      audited: true
    },
    {
      id: '3',
      name: 'Staking Contract',
      category: 'DeFi',
      description: 'Flexible staking pool with rewards distribution',
      popularity: 76,
      gasEstimate: 4200000,
      audited: true
    },
    {
      id: '4',
      name: 'Multi-Signature Wallet',
      category: 'Security',
      description: 'Secure multi-sig wallet requiring multiple approvals',
      popularity: 82,
      gasEstimate: 3200000,
      audited: true
    },
    {
      id: '5',
      name: 'DEX Router',
      category: 'DeFi',
      description: 'Decentralized exchange router for token swaps',
      popularity: 71,
      gasEstimate: 5500000,
      audited: false
    },
    {
      id: '6',
      name: 'Vesting Contract',
      category: 'Finance',
      description: 'Token vesting schedule for team and investors',
      popularity: 68,
      gasEstimate: 2800000,
      audited: true
    }
  ];

  const contractStats = {
    totalDeployed: 47,
    totalTransactions: 560374,
    totalValueLocked: 8928374,
    averageGasCost: 3.2,
    successRate: 98.5,
    auditedContracts: 42
  };

  const handleDeploy = () => {
    if (!contractName || !contractCode) {
      toast({
        title: "Missing Information",
        description: "Please provide contract name and code",
        variant: "destructive"
      });
      return;
    }

    setCompileStatus('compiling');
    
    setTimeout(() => {
      setCompileStatus('success');
      toast({
        title: "Contract Deployed",
        description: `${contractName} has been successfully deployed to ${selectedNetwork}`,
      });
    }, 2000);
  };

  const handleCompile = () => {
    if (!contractCode) {
      toast({
        title: "No Code to Compile",
        description: "Please enter smart contract code",
        variant: "destructive"
      });
      return;
    }

    setCompileStatus('compiling');
    
    setTimeout(() => {
      setCompileStatus('success');
      toast({
        title: "Compilation Successful",
        description: "Smart contract compiled without errors",
      });
    }, 1500);
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: "Copied",
      description: "Contract address copied to clipboard",
    });
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'deployed':
        return <Badge className="bg-green-500/10 text-green-500">Deployed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-500">Pending</Badge>;
      case 'auditing':
        return <Badge className="bg-blue-500/10 text-blue-500">Auditing</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/10 text-red-500">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      'ERC20': 'bg-purple-500/10 text-purple-500',
      'ERC721': 'bg-blue-500/10 text-blue-500',
      'ERC1155': 'bg-indigo-500/10 text-indigo-500',
      'DeFi': 'bg-green-500/10 text-green-500',
      'Governance': 'bg-orange-500/10 text-orange-500',
      'Custom': 'bg-gray-500/10 text-gray-500'
    };
    return <Badge className={colors[type] || 'bg-gray-500/10 text-gray-500'}>{type}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-b">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <Badge className="mb-4" variant="outline">
              <FileCode className="w-3 h-3 mr-1" /> Smart Contracts
            </Badge>
            <h1 className="text-4xl font-bold mb-4">Smart Contracts Manager</h1>
            <p className="text-muted-foreground text-lg">
              Deploy, manage, and monitor smart contracts on the MOLOCHAIN network. 
              Access pre-audited templates and comprehensive development tools.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Deployed</p>
                  <p className="text-lg font-bold">{contractStats.totalDeployed}</p>
                </div>
                <Package className="w-4 h-4 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Transactions</p>
                  <p className="text-lg font-bold">{(contractStats.totalTransactions / 1000).toFixed(0)}K</p>
                </div>
                <Activity className="w-4 h-4 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">TVL</p>
                  <p className="text-lg font-bold">${(contractStats.totalValueLocked / 1000000).toFixed(1)}M</p>
                </div>
                <DollarSign className="w-4 h-4 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Avg Gas</p>
                  <p className="text-lg font-bold">{contractStats.averageGasCost} Gwei</p>
                </div>
                <Zap className="w-4 h-4 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Success Rate</p>
                  <p className="text-lg font-bold">{contractStats.successRate}%</p>
                </div>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Audited</p>
                  <p className="text-lg font-bold">{contractStats.auditedContracts}</p>
                </div>
                <Shield className="w-4 h-4 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="deployed" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="deployed">Deployed Contracts</TabsTrigger>
            <TabsTrigger value="deploy">Deploy New</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="interact">Interact</TabsTrigger>
          </TabsList>

          {/* Deployed Contracts Tab */}
          <TabsContent value="deployed" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Your Smart Contracts</CardTitle>
                    <CardDescription>
                      Manage and monitor your deployed smart contracts
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Filter className="w-4 h-4 mr-1" />
                      Filter
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deployedContracts.map((contract) => (
                    <div key={contract.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-lg">{contract.name}</h3>
                            {getTypeBadge(contract.type)}
                            {getStatusBadge(contract.status)}
                            {contract.audited && (
                              <Badge className="bg-green-500/10 text-green-500">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Audited
                              </Badge>
                            )}
                            {contract.upgradeable && (
                              <Badge variant="outline">
                                <RefreshCw className="w-3 h-3 mr-1" />
                                Upgradeable
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Hash className="w-3 h-3" />
                            <code className="font-mono">{contract.address.slice(0, 10)}...{contract.address.slice(-8)}</code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyAddress(contract.address)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Deployed {contract.deployedAt}
                            </span>
                            <span className="flex items-center gap-1">
                              <Activity className="w-3 h-3" />
                              {(contract.transactions / 1000).toFixed(0)}K txns
                            </span>
                            <span className="flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              {(contract.gasUsed / 1000000).toFixed(1)}M gas
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              {(contract.balance / 1000).toFixed(0)}K MOLOCHAIN
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            <Terminal className="w-4 h-4 mr-1" />
                            Interact
                          </Button>
                          <Button size="sm" variant="outline">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Deploy New Tab */}
          <TabsContent value="deploy" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contract Code</CardTitle>
                  <CardDescription>
                    Write or paste your smart contract code
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Contract Name</Label>
                      <Input
                        placeholder="MySmartContract"
                        value={contractName}
                        onChange={(e) => setContractName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Network</Label>
                      <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mainnet">MOLOCHAIN Mainnet</SelectItem>
                          <SelectItem value="testnet">MOLOCHAIN Testnet</SelectItem>
                          <SelectItem value="local">Local Network</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Smart Contract Code</Label>
                      <Textarea
                        placeholder="pragma solidity ^0.8.0;&#10;&#10;contract MyContract {&#10;    // Your code here&#10;}"
                        value={contractCode}
                        onChange={(e) => setContractCode(e.target.value)}
                        className="font-mono h-64"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleCompile} disabled={compileStatus === 'compiling'}>
                        {compileStatus === 'compiling' ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Code className="w-4 h-4 mr-2" />
                        )}
                        Compile
                      </Button>
                      <Button onClick={handleDeploy} disabled={compileStatus !== 'success'}>
                        <Upload className="w-4 h-4 mr-2" />
                        Deploy
                      </Button>
                    </div>
                    {compileStatus === 'success' && (
                      <Alert>
                        <CheckCircle className="w-4 h-4" />
                        <AlertDescription>
                          Contract compiled successfully. Ready for deployment.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Deployment Configuration</CardTitle>
                  <CardDescription>
                    Configure deployment parameters
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Gas Estimate</span>
                        <span className="text-sm text-muted-foreground">~2.5M gas</span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Gas Price</span>
                        <span className="text-sm text-muted-foreground">3 Gwei</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Total Cost</span>
                        <span className="text-sm font-bold">~7.5 MOLOCHAIN</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Constructor Parameters</Label>
                      <Input placeholder="Enter parameters (comma separated)" />
                    </div>

                    <div className="space-y-2">
                      <Label>Initial Value</Label>
                      <Input placeholder="0" type="number" />
                    </div>

                    <div className="space-y-3">
                      <Label>Security Options</Label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" defaultChecked />
                          <span className="text-sm">Enable upgradeability</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" defaultChecked />
                          <span className="text-sm">Add access control</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">Enable pausable</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" defaultChecked />
                          <span className="text-sm">Request audit after deployment</span>
                        </label>
                      </div>
                    </div>

                    <Alert>
                      <Shield className="w-4 h-4" />
                      <AlertDescription>
                        All contracts deployed through MOLOCHAIN Manager include basic security features and are eligible for free auditing.
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Contract Templates</CardTitle>
                    <CardDescription>
                      Pre-built, audited smart contract templates
                    </CardDescription>
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="token">Token</SelectItem>
                      <SelectItem value="nft">NFT</SelectItem>
                      <SelectItem value="defi">DeFi</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {contractTemplates.map((template) => (
                    <Card key={template.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{template.name}</h3>
                            <Badge variant="outline" className="mt-1">{template.category}</Badge>
                          </div>
                          {template.audited && (
                            <Badge className="bg-green-500/10 text-green-500">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Audited
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          {template.description}
                        </p>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Popularity</span>
                            <div className="flex items-center gap-1">
                              <div className="w-20 bg-muted rounded-full h-1.5">
                                <div
                                  className="bg-primary h-1.5 rounded-full"
                                  style={{ width: `${template.popularity}%` }}
                                />
                              </div>
                              <span>{template.popularity}%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Gas Estimate</span>
                            <span>{(template.gasEstimate / 1000000).toFixed(1)}M</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1">
                            <Eye className="w-4 h-4 mr-1" />
                            Preview
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Upload className="w-4 h-4 mr-1" />
                            Use
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Interact Tab */}
          <TabsContent value="interact" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contract Interaction</CardTitle>
                  <CardDescription>
                    Call functions and read data from deployed contracts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Contract Address</Label>
                      <Input placeholder="0x..." />
                    </div>
                    <div className="space-y-2">
                      <Label>Function</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select function" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="balanceOf">balanceOf(address)</SelectItem>
                          <SelectItem value="transfer">transfer(address, uint256)</SelectItem>
                          <SelectItem value="approve">approve(address, uint256)</SelectItem>
                          <SelectItem value="totalSupply">totalSupply()</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Parameters</Label>
                      <Input placeholder="Enter function parameters" />
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1">
                        <Play className="w-4 h-4 mr-1" />
                        Execute
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Eye className="w-4 h-4 mr-1" />
                        Read
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Transaction Result</CardTitle>
                  <CardDescription>
                    View the output of your contract interactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-muted rounded-lg font-mono text-sm">
                    <p className="text-muted-foreground">// Output will appear here</p>
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

export default SmartContractsManager;