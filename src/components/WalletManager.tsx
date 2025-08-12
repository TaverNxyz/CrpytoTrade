import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Plus, Send, RadioReceiver as Receive, Copy, ExternalLink, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';

export const WalletManager = () => {
  const { wallets, loading, generateWalletAddress, validateTransactionAddress, createTestTransaction } = useWallet();
  const { toast } = useToast();
  const [selectedWallet, setSelectedWallet] = useState<string>('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [isGeneratingAddress, setIsGeneratingAddress] = useState(false);
  const [isValidatingAddress, setIsValidatingAddress] = useState(false);
  const [addressValid, setAddressValid] = useState<boolean | null>(null);

  const formatBalance = (balance: number) => {
    if (balance === 0) return '0.00';
    if (balance < 0.01) return balance.toFixed(8);
    return balance.toFixed(4);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Address copied to clipboard",
    });
  };

  const handleGenerateAddress = async (walletId: string, symbol: string) => {
    try {
      setIsGeneratingAddress(true);
      const wallet = wallets.find(w => w.id === walletId);
      if (!wallet) return;

      const address = await generateWalletAddress(wallet.cryptocurrency_id, symbol);
      
      toast({
        title: "Success",
        description: `New ${symbol} address generated successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate address",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingAddress(false);
    }
  };

  const handleValidateAddress = async (address: string, currency: string) => {
    if (!address) {
      setAddressValid(null);
      return;
    }

    setIsValidatingAddress(true);
    
    // Simulate validation delay
    setTimeout(() => {
      const isValid = validateTransactionAddress(address, currency);
      setAddressValid(isValid);
      setIsValidatingAddress(false);
    }, 500);
  };

  const handleSendTransaction = async () => {
    if (!selectedWallet || !recipientAddress || !sendAmount) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const wallet = wallets.find(w => w.id === selectedWallet);
    if (!wallet) return;

    const amount = parseFloat(sendAmount);
    if (amount <= 0 || amount > wallet.available_balance) {
      toast({
        title: "Error",
        description: "Invalid amount or insufficient balance",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create test transaction first for small amounts
      if (amount > 0.01) {
        const testTx = await createTestTransaction(wallet.symbol, recipientAddress, 0.001);
        
        toast({
          title: "Test Transaction Created",
          description: `Test transaction of 0.001 ${wallet.symbol} created. Please verify before sending the full amount.`,
        });
        
        return;
      }

      // For demo purposes, just show success
      toast({
        title: "Transaction Sent",
        description: `${amount} ${wallet.symbol} sent to ${recipientAddress.substring(0, 10)}...`,
      });
      
      // Reset form
      setRecipientAddress('');
      setSendAmount('');
      setSelectedWallet('');
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send transaction",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading wallets...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gradient mb-4">Wallet Manager</h2>
        <p className="text-muted-foreground">
          Manage your cryptocurrency wallets and transactions securely
        </p>
      </div>

      {/* Wallet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wallets.map((wallet, index) => (
          <motion.div
            key={wallet.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass glass-hover">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">
                    {wallet.symbol}
                  </CardTitle>
                  <Badge variant="outline">{wallet.name}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-2xl font-bold text-gradient">
                    {formatBalance(wallet.total_balance)}
                  </p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Available: {formatBalance(wallet.available_balance)}</p>
                    <p>Locked: {formatBalance(wallet.locked_balance)}</p>
                  </div>
                </div>

                {wallet.deposit_address && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Deposit Address</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-xs bg-muted p-1 rounded flex-1 truncate">
                        {wallet.deposit_address}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(wallet.deposit_address)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Receive className="w-4 h-4 mr-2" />
                        Receive
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Receive {wallet.symbol}</DialogTitle>
                        <DialogDescription>
                          Use this address to receive {wallet.symbol} deposits
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        {wallet.deposit_address ? (
                          <div className="text-center space-y-4">
                            <div className="p-4 bg-white rounded-lg">
                              <div className="w-48 h-48 bg-gray-200 rounded mx-auto flex items-center justify-center">
                                <span className="text-xs text-gray-500">QR Code</span>
                              </div>
                            </div>
                            <div>
                              <Label>Deposit Address</Label>
                              <div className="flex items-center gap-2 mt-1">
                                <Input value={wallet.deposit_address} readOnly />
                                <Button
                                  variant="outline"
                                  onClick={() => copyToClipboard(wallet.deposit_address)}
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center space-y-4">
                            <p className="text-muted-foreground">No deposit address generated yet</p>
                            <Button
                              onClick={() => handleGenerateAddress(wallet.id, wallet.symbol)}
                              disabled={isGeneratingAddress}
                              className="button-gradient"
                            >
                              {isGeneratingAddress ? "Generating..." : "Generate Address"}
                            </Button>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setSelectedWallet(wallet.id)}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Send
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Send {wallet.symbol}</DialogTitle>
                        <DialogDescription>
                          Send {wallet.symbol} to another wallet address
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Recipient Address</Label>
                          <div className="relative">
                            <Input
                              value={recipientAddress}
                              onChange={(e) => {
                                setRecipientAddress(e.target.value);
                                handleValidateAddress(e.target.value, wallet.symbol);
                              }}
                              placeholder={`Enter ${wallet.symbol} address`}
                              className={
                                addressValid === false ? 'border-red-500' : 
                                addressValid === true ? 'border-green-500' : ''
                              }
                            />
                            {isValidatingAddress && (
                              <RefreshCw className="absolute right-3 top-3 w-4 h-4 animate-spin" />
                            )}
                            {addressValid === true && (
                              <CheckCircle className="absolute right-3 top-3 w-4 h-4 text-green-500" />
                            )}
                            {addressValid === false && (
                              <AlertTriangle className="absolute right-3 top-3 w-4 h-4 text-red-500" />
                            )}
                          </div>
                          {addressValid === false && (
                            <p className="text-xs text-red-500 mt-1">Invalid address format</p>
                          )}
                        </div>

                        <div>
                          <Label>Amount</Label>
                          <Input
                            type="number"
                            value={sendAmount}
                            onChange={(e) => setSendAmount(e.target.value)}
                            placeholder="0.00"
                            max={wallet.available_balance}
                            step="0.00000001"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Available: {formatBalance(wallet.available_balance)} {wallet.symbol}
                          </p>
                        </div>

                        {parseFloat(sendAmount) > 0.01 && (
                          <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              For amounts over 0.01 {wallet.symbol}, we'll send a test transaction first to verify the address.
                            </AlertDescription>
                          </Alert>
                        )}

                        <Button
                          onClick={handleSendTransaction}
                          disabled={!recipientAddress || !sendAmount || addressValid === false}
                          className="w-full button-gradient"
                        >
                          Send {wallet.symbol}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {wallets.length === 0 && (
        <Card className="glass text-center p-8">
          <Wallet className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Wallets Found</h3>
          <p className="text-muted-foreground mb-4">
            Your wallets will appear here once they're created automatically.
          </p>
        </Card>
      )}
    </div>
  );
};