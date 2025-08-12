import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CryptoUtils } from '@/lib/crypto';
import { useAuth } from './useAuth';

export interface WalletData {
  id: string;
  cryptocurrency_id: string;
  symbol: string;
  name: string;
  available_balance: number;
  locked_balance: number;
  total_balance: number;
  deposit_address: string;
  cold_storage_address?: string;
}

export interface WalletSecurity {
  hasSeedPhrase: boolean;
  has2FA: boolean;
  hasHardwareWallet: boolean;
  backupCodesCount: number;
  lastBackupDate?: string;
}

export const useWallet = () => {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [security, setSecurity] = useState<WalletSecurity>({
    hasSeedPhrase: false,
    has2FA: false,
    hasHardwareWallet: false,
    backupCodesCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user wallets
  const fetchWallets = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('wallets')
        .select(`
          *,
          cryptocurrencies (
            symbol,
            name
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const walletsData = data?.map(wallet => ({
        id: wallet.id,
        cryptocurrency_id: wallet.cryptocurrency_id,
        symbol: wallet.cryptocurrencies.symbol,
        name: wallet.cryptocurrencies.name,
        available_balance: wallet.available_balance,
        locked_balance: wallet.locked_balance,
        total_balance: wallet.total_balance,
        deposit_address: wallet.deposit_address || '',
        cold_storage_address: wallet.cold_storage_address
      })) || [];

      setWallets(walletsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch wallets');
    } finally {
      setLoading(false);
    }
  };

  // Generate new wallet addresses
  const generateWalletAddress = async (cryptocurrencyId: string, symbol: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Generate a new address (in production, use proper key derivation)
      const privateKey = CryptoUtils.generateSeed(32);
      const address = CryptoUtils.generateAddress(privateKey, symbol);

      // Update wallet with new address
      const { error } = await supabase
        .from('wallets')
        .update({ 
          deposit_address: address,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('cryptocurrency_id', cryptocurrencyId);

      if (error) throw error;

      // Refresh wallets
      await fetchWallets();
      
      return address;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to generate address');
    }
  };

  // Create seed phrase backup
  const createSeedPhrase = async (password: string): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Generate mnemonic seed phrase
      const mnemonic = CryptoUtils.generateMnemonic(12);
      
      // Encrypt the seed phrase
      const encryptedSeed = CryptoUtils.encrypt(mnemonic, password);
      
      // Store encrypted seed in user profile
      const { error } = await supabase
        .from('user_profiles')
        .update({
          notification_preferences: {
            ...security,
            encrypted_seed: encryptedSeed,
            seed_created_at: new Date().toISOString()
          }
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setSecurity(prev => ({ ...prev, hasSeedPhrase: true }));
      
      return mnemonic;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create seed phrase');
    }
  };

  // Enable 2FA
  const enable2FA = async (): Promise<{ secret: string; qrCode: string; backupCodes: string[] }> => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Generate 2FA secret and backup codes
      const secret = CryptoUtils.generateSeed(20).toString('base32');
      const backupCodes = CryptoUtils.generateBackupCodes(10);
      
      // In production, generate proper TOTP QR code
      const qrCode = `otpauth://totp/CryptoTrade:${user.email}?secret=${secret}&issuer=CryptoTrade`;
      
      // Update user profile
      const { error } = await supabase
        .from('user_profiles')
        .update({
          two_factor_enabled: true,
          two_factor_secret: secret,
          backup_codes: backupCodes
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setSecurity(prev => ({ 
        ...prev, 
        has2FA: true, 
        backupCodesCount: backupCodes.length 
      }));
      
      return { secret, qrCode, backupCodes };
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to enable 2FA');
    }
  };

  // Validate transaction address
  const validateTransactionAddress = (address: string, currency: string): boolean => {
    return CryptoUtils.validateAddress(address, currency);
  };

  // Create test transaction
  const createTestTransaction = async (
    toCurrency: string, 
    toAddress: string, 
    amount: number = 0.001
  ) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Validate address
      if (!validateTransactionAddress(toAddress, toCurrency)) {
        throw new Error('Invalid recipient address');
      }

      // Create test transaction record
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          transaction_type: 'withdrawal',
          amount: amount,
          status: 'pending',
          external_address: toAddress,
          description: `Test transaction - ${amount} ${toCurrency}`,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create test transaction');
    }
  };

  // Fetch security status
  const fetchSecurityStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('two_factor_enabled, backup_codes, notification_preferences')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      setSecurity({
        hasSeedPhrase: !!data.notification_preferences?.encrypted_seed,
        has2FA: data.two_factor_enabled || false,
        hasHardwareWallet: false, // Would be detected from wallet connections
        backupCodesCount: data.backup_codes?.length || 0,
        lastBackupDate: data.notification_preferences?.seed_created_at
      });
    } catch (err) {
      console.error('Failed to fetch security status:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWallets();
      fetchSecurityStatus();
    }
  }, [user]);

  return {
    wallets,
    security,
    loading,
    error,
    generateWalletAddress,
    createSeedPhrase,
    enable2FA,
    validateTransactionAddress,
    createTestTransaction,
    refetch: fetchWallets
  };
};