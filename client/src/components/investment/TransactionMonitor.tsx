import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWallet } from '@/services/wallet/WalletProvider';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  ExternalLink,
  Copy,
  AlertCircle 
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Transaction {
  hash: string;
  from: string;
  to: string;
  amount: string;
  status: 'pending' | 'confirmed' | 'failed';
  confirmations: number;
  timestamp: Date;
  network: string;
}

interface TransactionMonitorProps {
  transactionHash?: string;
  onComplete?: () => void;
}

export function TransactionMonitor({ transactionHash, onComplete }: TransactionMonitorProps) {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const wallet = useWallet();

  useEffect(() => {
    if (transactionHash && wallet.isConnected) {
      monitorTransaction(transactionHash);
    }
  }, [transactionHash, wallet.isConnected]);

  const monitorTransaction = async (hash: string) => {
    setIsMonitoring(true);
    
    // Simulate transaction monitoring (in production, use ethers.js to get real tx data)
    const mockTransaction: Transaction = {
      hash,
      from: wallet.address || '',
      to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb8',
      amount: '0.5',
      status: 'pending',
      confirmations: 0,
      timestamp: new Date(),
      network: 'Ethereum'
    };
    
    setTransaction(mockTransaction);
    
    // Simulate confirmation process
    let confirmations = 0;
    const interval = setInterval(() => {
      confirmations++;
      setTransaction(prev => {
        if (!prev) return null;
        const updated = { 
          ...prev, 
          confirmations,
          status: confirmations >= 12 ? 'confirmed' : 'pending'
        };
        
        if (confirmations >= 12) {
          clearInterval(interval);
          setIsMonitoring(false);
          toast({
            title: 'Transaction confirmed!',
            description: 'Your investment has been successfully processed'
          });
          onComplete?.();
        }
        
        return updated as Transaction;
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Transaction hash copied to clipboard'
    });
  };

  const getExplorerUrl = (hash: string) => {
    const chainId = wallet.chainId;
    const explorers: Record<number, string> = {
      1: `https://etherscan.io/tx/${hash}`,
      137: `https://polygonscan.com/tx/${hash}`,
      56: `https://bscscan.com/tx/${hash}`,
      42161: `https://arbiscan.io/tx/${hash}`,
      8453: `https://basescan.org/tx/${hash}`
    };
    return explorers[chainId || 1] || `https://etherscan.io/tx/${hash}`;
  };

  if (!transaction) return null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Transaction Monitor</span>
          {transaction.status === 'pending' && (
            <Loader2 className="h-5 w-5 animate-spin" />
          )}
          {transaction.status === 'confirmed' && (
            <CheckCircle className="h-5 w-5 text-green-600" />
          )}
          {transaction.status === 'failed' && (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Transaction Hash */}
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Transaction Hash</div>
          <div className="flex items-center gap-2">
            <code className="text-xs bg-muted px-2 py-1 rounded flex-1 overflow-hidden text-ellipsis">
              {transaction.hash}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(transaction.hash)}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(getExplorerUrl(transaction.hash), '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status</span>
          <Badge 
            variant={
              transaction.status === 'confirmed' ? 'default' : 
              transaction.status === 'failed' ? 'destructive' : 
              'secondary'
            }
          >
            {transaction.status}
          </Badge>
        </div>

        {/* Confirmations */}
        {transaction.status === 'pending' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Confirmations</span>
              <span>{transaction.confirmations} / 12</span>
            </div>
            <Progress value={(transaction.confirmations / 12) * 100} />
          </div>
        )}

        {/* Transaction Details */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-medium">{transaction.amount} ETH</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Network</span>
            <span>{transaction.network}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Time</span>
            <span>{transaction.timestamp.toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Alert for pending transactions */}
        {transaction.status === 'pending' && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your transaction is being processed. This typically takes 2-5 minutes depending on network congestion.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}