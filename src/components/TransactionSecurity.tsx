import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  ExternalLink,
  Copy,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'trade' | 'transfer';
  currency: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  address?: string;
  txHash?: string;
  timestamp: string;
  fee?: number;
}

export const TransactionSecurity = () => {
  const { toast } = useToast();
  const [whitelistAddress, setWhitelistAddress] = useState('');
  const [withdrawalLimit, setWithdrawalLimit] = useState('10000');
  const [selectedTx, setSelectedTx] = useState<string>('');

  // Mock transaction data
  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'withdrawal',
      currency: 'BTC',
      amount: 0.5,
      status: 'completed',
      address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      txHash: '0x1234567890abcdef...',
      timestamp: '2025-01-18T10:30:00Z',
      fee: 0.0001
    },
    {
      id: '2',
      type: 'deposit',
      currency: 'ETH',
      amount: 2.5,
      status: 'processing',
      address: '0x742d35Cc6634C0532925a3b8D4C0C8b3C2e1e1e1',
      txHash: '0xabcdef1234567890...',
      timestamp: '2025-01-18T09:15:00Z'
    },
    {
      id: '3',
      type: 'trade',
      currency: 'SOL',
      amount: 100,
      status: 'completed',
      timestamp: '2025-01-18T08:45:00Z'
    }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Text copied to clipboard",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'processing':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return `${amount.toFixed(8)} ${currency}`;
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gradient mb-4">Transaction Security</h2>
        <p className="text-muted-foreground">
          Monitor and secure your cryptocurrency transactions
        </p>
      </div>

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          <TabsTrigger value="security">Security Settings</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-gradient" />
                Recent Transactions
              </CardTitle>
              <CardDescription>
                View and monitor your recent cryptocurrency transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((tx, index) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass rounded-lg p-4 hover:bg-primary/5 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(tx.status)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium capitalize">{tx.type}</span>
                            <Badge variant={getStatusColor(tx.status)}>
                              {tx.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(tx.timestamp)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold text-gradient">
                          {tx.type === 'withdrawal' ? '-' : '+'}{formatAmount(tx.amount, tx.currency)}
                        </p>
                        {tx.fee && (
                          <p className="text-xs text-muted-foreground">
                            Fee: {formatAmount(tx.fee, tx.currency)}
                          </p>
                        )}
                      </div>
                    </div>

                    {tx.address && (
                      <div className="mt-3 pt-3 border-t border-primary/20">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Address:</span>
                          <code className="bg-muted px-2 py-1 rounded text-xs">
                            {tx.address.substring(0, 20)}...
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(tx.address!)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {tx.txHash && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Tx Hash:</span>
                          <code className="bg-muted px-2 py-1 rounded text-xs">
                            {tx.txHash.substring(0, 20)}...
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(tx.txHash!)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Address Whitelist</CardTitle>
                <CardDescription>
                  Add trusted addresses for enhanced security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="whitelist">Whitelist Address</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="whitelist"
                      value={whitelistAddress}
                      onChange={(e) => setWhitelistAddress(e.target.value)}
                      placeholder="Enter address to whitelist"
                    />
                    <Button variant="outline">Add</Button>
                  </div>
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Whitelisted addresses allow withdrawals without additional confirmation.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <h4 className="font-medium">Current Whitelist</h4>
                  <div className="text-sm text-muted-foreground">
                    No addresses whitelisted yet
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle>Withdrawal Limits</CardTitle>
                <CardDescription>
                  Set daily withdrawal limits for added security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="limit">Daily Withdrawal Limit (USD)</Label>
                  <Input
                    id="limit"
                    type="number"
                    value={withdrawalLimit}
                    onChange={(e) => setWithdrawalLimit(e.target.value)}
                    placeholder="10000"
                  />
                </div>

                <Button className="w-full button-gradient">
                  Update Limit
                </Button>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Higher limits may require additional verification steps.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Security Monitoring</CardTitle>
              <CardDescription>
                Real-time monitoring of your account activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h4 className="font-medium">Account Status</h4>
                  <Badge variant="default">Secure</Badge>
                </div>

                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                    <Eye className="w-8 h-8 text-blue-500" />
                  </div>
                  <h4 className="font-medium">Active Sessions</h4>
                  <Badge variant="secondary">1 Device</Badge>
                </div>

                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-8 h-8 text-yellow-500" />
                  </div>
                  <h4 className="font-medium">Security Alerts</h4>
                  <Badge variant="outline">0 Alerts</Badge>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <h4 className="font-medium">Recent Security Events</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Successful login</span>
                    </div>
                    <span className="text-xs text-muted-foreground">2 hours ago</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">2FA verification successful</span>
                    </div>
                    <span className="text-xs text-muted-foreground">1 day ago</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};