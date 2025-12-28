import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  FileCode,
  Shield,
  Activity,
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  Code,
  Layers,
  Zap,
  Lock,
  Users,
  TrendingUp,
  Clock,
  Database,
  GitBranch,
  Terminal
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface SmartContract {
  id: string;
  name: string;
  address: string;
  type: 'core' | 'defi' | 'governance' | 'utility';
  status: 'active' | 'paused' | 'upgrading';
  deployedAt: Date;
  lastActivity: Date;
  transactions: number;
  gasUsed: string;
  version: string;
  audited: boolean;
  description: string;
  functions: string[];
}

const SmartContracts = () => {
  const { toast } = useToast();
  const [selectedContract, setSelectedContract] = useState<string | null>(null);
  const [contracts, setContracts] = useState<SmartContract[]>([
    {
      id: '1',
      name: 'MOLOCHAIN Token',
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bE8b',
      type: 'core',
      status: 'active',
      deployedAt: new Date('2024-01-15'),
      lastActivity: new Date(),
      transactions: 1847293,
      gasUsed: '847.3 ETH',
      version: '2.1.0',
      audited: true,
      description: 'Main MOLOCHAIN token contract with burn mechanism and staking capabilities',
      functions: ['transfer', 'approve', 'stake', 'burn', 'mint', 'pause']
    },
    {
      id: '2',
      name: 'Logistics Registry',
      address: '0x8B3c44Dd5634C0532925a3b844Bc9e7595f0bE9c',
      type: 'utility',
      status: 'active',
      deployedAt: new Date('2024-02-20'),
      lastActivity: new Date(),
      transactions: 523847,
      gasUsed: '234.7 ETH',
      version: '1.5.2',
      audited: true,
      description: 'Decentralized registry for logistics providers and shipment tracking',
      functions: ['registerProvider', 'updateShipment', 'verifyDelivery', 'disputeResolution']
    },
    {
      id: '3',
      name: 'Staking Pool',
      address: '0x9C4d55Ee6745D1643036b4a955Cd0f8706g1cF0d',
      type: 'defi',
      status: 'active',
      deployedAt: new Date('2024-03-10'),
      lastActivity: new Date(),
      transactions: 892374,
      gasUsed: '412.8 ETH',
      version: '1.8.0',
      audited: true,
      description: 'Staking contract for MOLOCHAIN tokens with variable APY rewards',
      functions: ['stake', 'unstake', 'claimRewards', 'compound', 'emergencyWithdraw']
    },
    {
      id: '4',
      name: 'DAO Governance',
      address: '0xA5e66Ff7856E2754147c5b066Dd1g9807h2dG1e',
      type: 'governance',
      status: 'active',
      deployedAt: new Date('2024-04-05'),
      lastActivity: new Date(),
      transactions: 128493,
      gasUsed: '89.3 ETH',
      version: '1.2.1',
      audited: true,
      description: 'Decentralized governance for protocol upgrades and treasury management',
      functions: ['propose', 'vote', 'execute', 'delegate', 'timelock']
    },
    {
      id: '5',
      name: 'Insurance Pool',
      address: '0xB6f77Gg8967F3865258d6c177Ee2h0918i3eH2f',
      type: 'defi',
      status: 'active',
      deployedAt: new Date('2024-05-12'),
      lastActivity: new Date(),
      transactions: 73829,
      gasUsed: '156.2 ETH',
      version: '1.0.3',
      audited: true,
      description: 'Smart contract insurance for shipment protection and claim processing',
      functions: ['purchaseInsurance', 'fileClaim', 'approveClaim', 'payoutClaim']
    },
    {
      id: '6',
      name: 'Bridge Contract',
      address: '0xC7g88Hh9078G4976369e7d288Ff3i1029j4fI3g',
      type: 'utility',
      status: 'upgrading',
      deployedAt: new Date('2024-06-18'),
      lastActivity: new Date(),
      transactions: 284739,
      gasUsed: '523.1 ETH',
      version: '2.0.0-beta',
      audited: false,
      description: 'Cross-chain bridge for MOLOCHAIN token interoperability',
      functions: ['lockTokens', 'releaseTokens', 'verifyProof', 'updateOracle']
    }
  ]);

  const [contractStats, setContractStats] = useState({
    totalContracts: 6,
    totalTransactions: 3876054,
    totalGasUsed: '2,263.4 ETH',
    activeUsers: 147829,
    tvl: '$428.7M',
    dailyVolume: '$12.4M'
  });

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: "Address Copied",
      description: "Contract address copied to clipboard",
    });
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'core': return 'bg-blue-500/10 text-blue-500';
      case 'defi': return 'bg-green-500/10 text-green-500';
      case 'governance': return 'bg-purple-500/10 text-purple-500';
      case 'utility': return 'bg-orange-500/10 text-orange-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-500/10 text-green-500';
      case 'paused': return 'bg-yellow-500/10 text-yellow-500';
      case 'upgrading': return 'bg-blue-500/10 text-blue-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
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
              <FileCode className="w-3 h-3 mr-1" /> Smart Contract Infrastructure
            </Badge>
            <h1 className="text-4xl font-bold mb-4">Smart Contracts</h1>
            <p className="text-muted-foreground text-lg">
              Explore MOLOCHAIN's deployed smart contracts, their functions, and real-time metrics.
              All core contracts are audited and verified for maximum security.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{contractStats.totalContracts}</div>
              <div className="text-sm text-muted-foreground">Total Contracts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{contractStats.totalTransactions.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Transactions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{contractStats.totalGasUsed}</div>
              <div className="text-sm text-muted-foreground">Gas Used</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{contractStats.activeUsers.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{contractStats.tvl}</div>
              <div className="text-sm text-muted-foreground">Total Value Locked</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{contractStats.dailyVolume}</div>
              <div className="text-sm text-muted-foreground">24h Volume</div>
            </CardContent>
          </Card>
        </div>

        {/* Contracts Grid */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="core">Core</TabsTrigger>
            <TabsTrigger value="defi">DeFi</TabsTrigger>
            <TabsTrigger value="governance">Governance</TabsTrigger>
            <TabsTrigger value="utility">Utility</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {contracts.map((contract) => (
                <motion.div
                  key={contract.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => setSelectedContract(contract.id)}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Code className="w-4 h-4" />
                            {contract.name}
                          </CardTitle>
                          <div className="flex gap-2 mt-2">
                            <Badge className={getTypeColor(contract.type)} variant="secondary">
                              {contract.type}
                            </Badge>
                            <Badge className={getStatusColor(contract.status)} variant="secondary">
                              {contract.status}
                            </Badge>
                            {contract.audited && (
                              <Badge variant="outline" className="bg-green-500/10">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Audited
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-4">
                        {contract.description}
                      </CardDescription>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Address:</span>
                          <div className="flex items-center gap-1">
                            <code className="text-xs bg-muted px-1 py-0.5 rounded">
                              {contract.address.slice(0, 6)}...{contract.address.slice(-4)}
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyAddress(contract.address);
                              }}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Transactions:</span>
                          <span className="font-mono">{contract.transactions.toLocaleString()}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Gas Used:</span>
                          <span className="font-mono">{contract.gasUsed}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Version:</span>
                          <Badge variant="outline" className="text-xs">
                            v{contract.version}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t">
                        <div className="text-xs text-muted-foreground mb-2">Available Functions:</div>
                        <div className="flex flex-wrap gap-1">
                          {contract.functions.slice(0, 3).map((func, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {func}()
                            </Badge>
                          ))}
                          {contract.functions.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{contract.functions.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Terminal className="w-3 h-3 mr-1" />
                          Interact
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Explorer
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {['core', 'defi', 'governance', 'utility'].map((type) => (
            <TabsContent key={type} value={type} className="mt-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {contracts.filter(c => c.type === type).map((contract) => (
                  <motion.div
                    key={contract.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Code className="w-4 h-4" />
                              {contract.name}
                            </CardTitle>
                            <div className="flex gap-2 mt-2">
                              <Badge className={getStatusColor(contract.status)} variant="secondary">
                                {contract.status}
                              </Badge>
                              {contract.audited && (
                                <Badge variant="outline" className="bg-green-500/10">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Audited
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="mb-4">
                          {contract.description}
                        </CardDescription>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Transactions:</span>
                            <span className="font-mono">{contract.transactions.toLocaleString()}</span>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Gas Used:</span>
                            <span className="font-mono">{contract.gasUsed}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Terminal className="w-3 h-3 mr-1" />
                            Interact
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Explorer
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <Card className="bg-gradient-to-r from-green-500/5 to-emerald-500/5 border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Security First Approach</h3>
                  <p className="text-muted-foreground text-sm">
                    All MOLOCHAIN smart contracts undergo rigorous security audits by leading blockchain security firms.
                    Our contracts are open-source and verified on multiple block explorers for complete transparency.
                  </p>
                  <div className="flex gap-3 mt-4">
                    <Button size="sm" variant="outline">
                      <FileCode className="w-3 h-3 mr-1" />
                      View Audit Reports
                    </Button>
                    <Button size="sm" variant="outline">
                      <GitBranch className="w-3 h-3 mr-1" />
                      GitHub Repository
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default SmartContracts;