import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  FileText,
  DollarSign,
  Shield,
  Activity,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Code,
  Zap,
  Lock,
  Unlock,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  CreditCard,
  Package,
  Truck,
  Settings,
  Info,
  Play,
  Pause,
  X,
  Check,
  Copy
} from 'lucide-react';
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';

interface SmartContract {
  id: string;
  name: string;
  type: 'milestone' | 'escrow' | 'subscription' | 'conditional';
  status: 'draft' | 'deployed' | 'active' | 'completed' | 'cancelled';
  parties: {
    sender: string;
    receiver: string;
    arbitrator?: string;
  };
  value: number;
  currency: 'ETH' | 'USDC' | 'USDT' | 'DAI';
  conditions: {
    milestone?: string;
    deliveryConfirmation?: boolean;
    qualityCheck?: boolean;
    timebound?: Date;
  };
  automation: {
    enabled: boolean;
    triggers: string[];
    actions: string[];
  };
  deployedAt?: Date;
  executedAt?: Date;
  gasUsed?: number;
  transactionHash?: string;
}

interface PaymentFlow {
  id: string;
  contractId: string;
  step: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  amount: number;
  timestamp: Date;
  description: string;
}

interface TransactionMetrics {
  totalVolume: number;
  totalTransactions: number;
  averageValue: number;
  successRate: number;
  averageGasUsed: number;
  totalSaved: number;
}

export default function SmartContractPayments() {
  const [contracts, setContracts] = useState<SmartContract[]>([]);
  const [selectedContract, setSelectedContract] = useState<SmartContract | null>(null);
  const [paymentFlows, setPaymentFlows] = useState<PaymentFlow[]>([]);
  const [metrics, setMetrics] = useState<TransactionMetrics>({
    totalVolume: 4567890,
    totalTransactions: 892,
    averageValue: 5121,
    successRate: 98.7,
    averageGasUsed: 45000,
    totalSaved: 234567
  });
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTab, setSelectedTab] = useState('active');
  const [automationEnabled, setAutomationEnabled] = useState(true);

  // Volume chart data
  const volumeData = [
    { date: 'Jan', volume: 450000, transactions: 78 },
    { date: 'Feb', volume: 520000, transactions: 92 },
    { date: 'Mar', volume: 580000, transactions: 105 },
    { date: 'Apr', volume: 620000, transactions: 112 },
    { date: 'May', volume: 750000, transactions: 134 },
    { date: 'Jun', volume: 890000, transactions: 156 },
    { date: 'Jul', volume: 920000, transactions: 168 }
  ];

  // Gas optimization data
  const gasData = [
    { method: 'Standard', gas: 120000, cost: 45 },
    { method: 'Optimized', gas: 45000, cost: 18 },
    { method: 'Batch', gas: 25000, cost: 10 },
    { method: 'Layer 2', gas: 5000, cost: 2 }
  ];

  // Initialize with sample contracts
  useEffect(() => {
    const sampleContracts: SmartContract[] = [
      {
        id: 'SC001',
        name: 'Shanghai to LA Shipment',
        type: 'milestone',
        status: 'active',
        parties: {
          sender: '0x742d35Cc6...2E8',
          receiver: '0x5aAeb605...8D3',
          arbitrator: '0x9B3f4cE8...5F2'
        },
        value: 85000,
        currency: 'USDC',
        conditions: {
          milestone: 'Delivery Confirmation',
          deliveryConfirmation: true,
          qualityCheck: true,
          timebound: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        },
        automation: {
          enabled: true,
          triggers: ['GPS Location', 'IoT Sensors', 'Document Verification'],
          actions: ['Release Payment', 'Update Status', 'Send Notification']
        },
        deployedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        gasUsed: 42000
      },
      {
        id: 'SC002',
        name: 'Monthly Logistics Service',
        type: 'subscription',
        status: 'active',
        parties: {
          sender: '0x892f73Aa9...7E1',
          receiver: '0x3B2c9De7...4A8'
        },
        value: 15000,
        currency: 'DAI',
        conditions: {
          milestone: 'Monthly Service',
          timebound: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
        automation: {
          enabled: true,
          triggers: ['Time-based', 'Service Completion'],
          actions: ['Recurring Payment', 'Invoice Generation']
        },
        deployedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        gasUsed: 38000
      },
      {
        id: 'SC003',
        name: 'Escrow for Equipment Purchase',
        type: 'escrow',
        status: 'deployed',
        parties: {
          sender: '0x4E8b2C9D...3F7',
          receiver: '0x7A3f5B2E...9C1',
          arbitrator: '0x1D4e8Fa3...2B6'
        },
        value: 250000,
        currency: 'USDT',
        conditions: {
          deliveryConfirmation: true,
          qualityCheck: true
        },
        automation: {
          enabled: false,
          triggers: [],
          actions: []
        },
        deployedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        gasUsed: 52000
      }
    ];

    setContracts(sampleContracts);
    setSelectedContract(sampleContracts[0]);

    // Sample payment flows
    setPaymentFlows([
      {
        id: 'PF001',
        contractId: 'SC001',
        step: 'Contract Deployed',
        status: 'completed',
        amount: 0,
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        description: 'Smart contract successfully deployed to blockchain'
      },
      {
        id: 'PF002',
        contractId: 'SC001',
        step: 'Initial Deposit',
        status: 'completed',
        amount: 85000,
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 60000),
        description: 'Funds locked in escrow'
      },
      {
        id: 'PF003',
        contractId: 'SC001',
        step: 'Shipment Departed',
        status: 'completed',
        amount: 0,
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        description: 'Milestone 1: Departure confirmed via GPS'
      },
      {
        id: 'PF004',
        contractId: 'SC001',
        step: 'Partial Payment Released',
        status: 'completed',
        amount: 25500,
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 120000),
        description: '30% released on departure confirmation'
      },
      {
        id: 'PF005',
        contractId: 'SC001',
        step: 'In Transit',
        status: 'processing',
        amount: 0,
        timestamp: new Date(),
        description: 'Monitoring shipment via IoT sensors'
      }
    ]);
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    if (!automationEnabled) return;

    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        totalVolume: prev.totalVolume + Math.floor(Math.random() * 10000),
        totalTransactions: prev.totalTransactions + (Math.random() > 0.7 ? 1 : 0)
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, [automationEnabled]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'deployed': return 'text-blue-600';
      case 'completed': return 'text-gray-600';
      case 'draft': return 'text-yellow-600';
      case 'cancelled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Activity className="h-4 w-4" />;
      case 'deployed': return <CheckCircle className="h-4 w-4" />;
      case 'completed': return <Check className="h-4 w-4" />;
      case 'draft': return <FileText className="h-4 w-4" />;
      case 'cancelled': return <X className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Code className="h-8 w-8 text-primary" />
            Smart Contract Payments
          </h1>
          <p className="text-muted-foreground mt-1">
            Automated blockchain-powered logistics payments
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setAutomationEnabled(!automationEnabled)}>
            {automationEnabled ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Pause Automation
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Resume Automation
              </>
            )}
          </Button>
          <Button onClick={() => setIsCreating(true)}>
            <FileText className="mr-2 h-4 w-4" />
            New Contract
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Volume</p>
                <p className="text-2xl font-bold">${(metrics.totalVolume / 1000000).toFixed(2)}M</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2 flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +23.4% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Transactions</p>
                <p className="text-2xl font-bold">{metrics.totalTransactions}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2 flex items-center text-xs text-blue-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +15.7% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Value</p>
                <p className="text-2xl font-bold">${metrics.averageValue}</p>
              </div>
              <CreditCard className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2 flex items-center text-xs text-muted-foreground">
              Per transaction
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{metrics.successRate}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <Progress value={metrics.successRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Gas</p>
                <p className="text-2xl font-bold">{(metrics.averageGasUsed / 1000).toFixed(0)}K</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="mt-2 flex items-center text-xs text-yellow-600">
              <ArrowDownRight className="h-3 w-3 mr-1" />
              -18% optimized
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Saved</p>
                <p className="text-2xl font-bold">${(metrics.totalSaved / 1000).toFixed(0)}K</p>
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2 flex items-center text-xs text-green-600">
              Via automation
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contract List */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Active Contracts</CardTitle>
              <CardDescription>
                Smart contracts managing payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {contracts.map((contract) => (
                    <div
                      key={contract.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedContract?.id === contract.id ? 'bg-accent' : 'hover:bg-accent/50'
                      }`}
                      onClick={() => setSelectedContract(contract)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm">{contract.name}</h4>
                            {contract.automation.enabled && (
                              <Badge variant="secondary" className="text-xs">
                                <Zap className="h-3 w-3 mr-1" />
                                Auto
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {contract.type.charAt(0).toUpperCase() + contract.type.slice(1)} Contract
                          </p>
                        </div>
                        <Badge className={getStatusColor(contract.status)}>
                          {getStatusIcon(contract.status)}
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="font-semibold">
                          {contract.value.toLocaleString()} {contract.currency}
                        </span>
                        <span className="text-muted-foreground">
                          {contract.deployedAt && format(contract.deployedAt, 'MMM dd')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Contract Details */}
        <div className="lg:col-span-2">
          {selectedContract ? (
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="flow">Payment Flow</TabsTrigger>
                <TabsTrigger value="automation">Automation</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{selectedContract.name}</CardTitle>
                        <CardDescription>
                          Contract ID: {selectedContract.id}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(selectedContract.status)}>
                        {selectedContract.status.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Contract Parties */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Contract Parties</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="flex items-center gap-2">
                            <ArrowUpRight className="h-4 w-4 text-green-500" />
                            <div>
                              <p className="text-xs text-muted-foreground">Sender</p>
                              <p className="text-sm font-mono">{selectedContract.parties.sender}</p>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => copyToClipboard(selectedContract.parties.sender)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="flex items-center gap-2">
                            <ArrowDownRight className="h-4 w-4 text-blue-500" />
                            <div>
                              <p className="text-xs text-muted-foreground">Receiver</p>
                              <p className="text-sm font-mono">{selectedContract.parties.receiver}</p>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => copyToClipboard(selectedContract.parties.receiver)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        {selectedContract.parties.arbitrator && (
                          <div className="flex items-center justify-between p-2 bg-muted rounded">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-purple-500" />
                              <div>
                                <p className="text-xs text-muted-foreground">Arbitrator</p>
                                <p className="text-sm font-mono">{selectedContract.parties.arbitrator}</p>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => copyToClipboard(selectedContract.parties.arbitrator || '')}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Contract Conditions */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Release Conditions</h4>
                      <div className="space-y-2">
                        {selectedContract.conditions.milestone && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Milestone: {selectedContract.conditions.milestone}</span>
                          </div>
                        )}
                        {selectedContract.conditions.deliveryConfirmation && (
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">Delivery Confirmation Required</span>
                          </div>
                        )}
                        {selectedContract.conditions.qualityCheck && (
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-purple-500" />
                            <span className="text-sm">Quality Check Required</span>
                          </div>
                        )}
                        {selectedContract.conditions.timebound && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">
                              Deadline: {format(selectedContract.conditions.timebound, 'MMM dd, yyyy')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Contract Metadata */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Contract Value</p>
                        <p className="text-lg font-semibold">
                          {selectedContract.value.toLocaleString()} {selectedContract.currency}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Gas Used</p>
                        <p className="text-lg font-semibold">
                          {selectedContract.gasUsed?.toLocaleString() || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Deployed</p>
                        <p className="text-sm">
                          {selectedContract.deployedAt 
                            ? format(selectedContract.deployedAt, 'MMM dd, yyyy HH:mm')
                            : 'Not deployed'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Contract Type</p>
                        <p className="text-sm capitalize">{selectedContract.type}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4">
                      {selectedContract.status === 'active' && (
                        <>
                          <Button className="flex-1">
                            <Play className="mr-2 h-4 w-4" />
                            Execute Payment
                          </Button>
                          <Button variant="outline" className="flex-1">
                            <Pause className="mr-2 h-4 w-4" />
                            Pause Contract
                          </Button>
                        </>
                      )}
                      {selectedContract.status === 'deployed' && (
                        <Button className="flex-1">
                          <Zap className="mr-2 h-4 w-4" />
                          Activate Contract
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="flow" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Flow Timeline</CardTitle>
                    <CardDescription>
                      Track payment milestones and executions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-4">
                        {paymentFlows
                          .filter(flow => flow.contractId === selectedContract.id)
                          .map((flow, index) => (
                            <div key={flow.id} className="flex gap-4">
                              <div className="relative">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  flow.status === 'completed' ? 'bg-green-100 text-green-600' :
                                  flow.status === 'processing' ? 'bg-blue-100 text-blue-600' :
                                  flow.status === 'failed' ? 'bg-red-100 text-red-600' :
                                  'bg-gray-100 text-gray-600'
                                }`}>
                                  {flow.status === 'completed' && <CheckCircle className="h-5 w-5" />}
                                  {flow.status === 'processing' && <RefreshCw className="h-5 w-5 animate-spin" />}
                                  {flow.status === 'failed' && <X className="h-5 w-5" />}
                                  {flow.status === 'pending' && <Clock className="h-5 w-5" />}
                                </div>
                                {index < paymentFlows.filter(f => f.contractId === selectedContract.id).length - 1 && (
                                  <div className="absolute top-10 left-5 w-0.5 h-16 bg-muted" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-semibold">{flow.step}</h4>
                                  <span className="text-sm text-muted-foreground">
                                    {format(flow.timestamp, 'MMM dd, HH:mm')}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {flow.description}
                                </p>
                                {flow.amount > 0 && (
                                  <Badge variant="outline" className="mt-2">
                                    {flow.amount.toLocaleString()} {selectedContract.currency}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="automation" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Automation Settings</CardTitle>
                        <CardDescription>
                          Configure automatic payment execution
                        </CardDescription>
                      </div>
                      <Switch
                        checked={selectedContract.automation.enabled}
                        onCheckedChange={(checked) => {
                          setSelectedContract({
                            ...selectedContract,
                            automation: { ...selectedContract.automation, enabled: checked }
                          });
                        }}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Triggers */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Automation Triggers</h4>
                      <div className="space-y-2">
                        {selectedContract.automation.triggers.map((trigger, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                            <Zap className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">{trigger}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Actions */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Automated Actions</h4>
                      <div className="space-y-2">
                        {selectedContract.automation.actions.map((action, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                            <Activity className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">{action}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Automation Status */}
                    {selectedContract.automation.enabled && (
                      <>
                        <Separator />
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertTitle>Automation Active</AlertTitle>
                          <AlertDescription>
                            This contract will automatically execute payments when all conditions are met. 
                            The system monitors triggers in real-time and executes actions without manual intervention.
                          </AlertDescription>
                        </Alert>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                {/* Volume Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Transaction Volume</CardTitle>
                    <CardDescription>
                      Monthly payment volume and transaction count
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={volumeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Area 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="volume" 
                          stroke="#8884d8" 
                          fill="#8884d8" 
                          fillOpacity={0.6}
                          name="Volume ($)"
                        />
                        <Line 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="transactions" 
                          stroke="#82ca9d"
                          name="Transactions"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Gas Optimization */}
                <Card>
                  <CardHeader>
                    <CardTitle>Gas Optimization</CardTitle>
                    <CardDescription>
                      Comparison of gas usage by transaction method
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={gasData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="method" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="gas" fill="#8884d8" name="Gas Used" />
                        <Bar dataKey="cost" fill="#82ca9d" name="Cost ($)" />
                      </BarChart>
                    </ResponsiveContainer>
                    <Alert className="mt-4">
                      <TrendingUp className="h-4 w-4" />
                      <AlertDescription>
                        Using optimized contracts saves an average of 62.5% in gas fees compared to standard transactions.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Select a contract to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}