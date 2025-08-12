import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Key, 
  Smartphone, 
  HardDrive, 
  Copy, 
  Eye, 
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';

export const WalletSecurity = () => {
  const { security, createSeedPhrase, enable2FA } = useWallet();
  const { toast } = useToast();
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [seedPhrase, setSeedPhrase] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const handleCreateSeedPhrase = async () => {
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Error", 
        description: "Password must be at least 8 characters long",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const mnemonic = await createSeedPhrase(password);
      setSeedPhrase(mnemonic);
      setShowSeedPhrase(true);
      
      toast({
        title: "Success",
        description: "Seed phrase created successfully. Please write it down and store it safely.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create seed phrase",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    try {
      setLoading(true);
      const { qrCode: qr, backupCodes: codes } = await enable2FA();
      setQrCode(qr);
      setBackupCodes(codes);
      
      toast({
        title: "Success",
        description: "2FA enabled successfully. Please save your backup codes.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to enable 2FA",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Text copied to clipboard",
    });
  };

  const downloadBackupCodes = () => {
    const content = backupCodes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cryptotrade-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gradient mb-4">Wallet Security</h2>
        <p className="text-muted-foreground">
          Secure your crypto assets with industry-leading security measures
        </p>
      </div>

      {/* Security Status Overview */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-gradient" />
            Security Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5" />
              <div>
                <p className="font-medium">Seed Phrase</p>
                <Badge variant={security.hasSeedPhrase ? "default" : "destructive"}>
                  {security.hasSeedPhrase ? "Created" : "Not Created"}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5" />
              <div>
                <p className="font-medium">2FA</p>
                <Badge variant={security.has2FA ? "default" : "destructive"}>
                  {security.has2FA ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <HardDrive className="w-5 h-5" />
              <div>
                <p className="font-medium">Hardware Wallet</p>
                <Badge variant={security.hasHardwareWallet ? "default" : "secondary"}>
                  {security.hasHardwareWallet ? "Connected" : "Not Connected"}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5" />
              <div>
                <p className="font-medium">Backup Codes</p>
                <Badge variant={security.backupCodesCount > 0 ? "default" : "secondary"}>
                  {security.backupCodesCount} codes
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seed Phrase Setup */}
      {!security.hasSeedPhrase && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-gradient" />
                Create Recovery Seed Phrase
              </CardTitle>
              <CardDescription>
                Your seed phrase is the master key to your wallet. Store it safely offline.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Critical:</strong> Write down your seed phrase on paper and store it in a secure location. 
                  Never store it digitally or share it with anyone.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">Encryption Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter a strong password"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                  />
                </div>
              </div>

              <Button 
                onClick={handleCreateSeedPhrase}
                disabled={loading || !password || !confirmPassword}
                className="w-full button-gradient"
              >
                {loading ? "Creating..." : "Generate Seed Phrase"}
              </Button>

              {showSeedPhrase && seedPhrase && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 p-4 glass rounded-lg border-2 border-primary/30"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gradient">Your Recovery Seed Phrase</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(seedPhrase)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {seedPhrase.split(' ').map((word, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                        <span className="text-xs text-muted-foreground w-6">{index + 1}.</span>
                        <span className="font-mono">{word}</span>
                      </div>
                    ))}
                  </div>

                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Important:</strong> Write these words down in order and store them safely. 
                      This is the only way to recover your wallet if you lose access.
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* 2FA Setup */}
      {!security.has2FA && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-gradient" />
                Enable Two-Factor Authentication
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to your account with 2FA.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleEnable2FA}
                disabled={loading}
                className="w-full button-gradient"
              >
                {loading ? "Setting up..." : "Enable 2FA"}
              </Button>

              {qrCode && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 space-y-4"
                >
                  <div className="text-center">
                    <h4 className="font-bold text-gradient mb-2">Scan QR Code</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Use Google Authenticator or similar app to scan this QR code
                    </p>
                    <div className="inline-block p-4 bg-white rounded-lg">
                      <div className="w-48 h-48 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-xs text-gray-500">QR Code: {qrCode.substring(0, 20)}...</span>
                      </div>
                    </div>
                  </div>

                  {backupCodes.length > 0 && (
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-gradient">Backup Codes</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={downloadBackupCodes}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {backupCodes.map((code, index) => (
                          <div key={index} className="p-2 bg-muted rounded font-mono text-sm">
                            {code}
                          </div>
                        ))}
                      </div>

                      <Alert>
                        <Shield className="h-4 w-4" />
                        <AlertDescription>
                          Save these backup codes in a secure location. You can use them to access your account if you lose your 2FA device.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Security Best Practices */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-gradient">Security Best Practices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gradient-secondary">Private Key Security</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Never share your private keys or seed phrase</li>
                  <li>• Store backups offline in multiple secure locations</li>
                  <li>• Use hardware wallets for large amounts</li>
                  <li>• Verify addresses before sending transactions</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-gradient-secondary">Account Security</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Enable 2FA on all accounts</li>
                  <li>• Use strong, unique passwords</li>
                  <li>• Keep software updated</li>
                  <li>• Avoid public Wi-Fi for trading</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};