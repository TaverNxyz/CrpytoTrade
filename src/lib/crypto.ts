import { createHash, randomBytes, pbkdf2Sync } from 'crypto';

// Crypto utility functions for wallet management
export class CryptoUtils {
  // Generate a secure random seed
  static generateSeed(length: number = 32): Buffer {
    return randomBytes(length);
  }

  // Generate mnemonic seed phrase (12 or 24 words)
  static generateMnemonic(wordCount: 12 | 24 = 12): string {
    // BIP39 word list (simplified for demo - in production use full BIP39 list)
    const wordList = [
      'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
      'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
      'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual',
      'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance',
      'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'against', 'age',
      'agent', 'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm',
      'album', 'alcohol', 'alert', 'alien', 'all', 'alley', 'allow', 'almost',
      'alone', 'alpha', 'already', 'also', 'alter', 'always', 'amateur', 'amazing',
      'among', 'amount', 'amused', 'analyst', 'anchor', 'ancient', 'anger', 'angle',
      'angry', 'animal', 'ankle', 'announce', 'annual', 'another', 'answer', 'antenna',
      'antique', 'anxiety', 'any', 'apart', 'apology', 'appear', 'apple', 'approve',
      'april', 'arch', 'arctic', 'area', 'arena', 'argue', 'arm', 'armed',
      'armor', 'army', 'around', 'arrange', 'arrest', 'arrive', 'arrow', 'art',
      'article', 'artist', 'artwork', 'ask', 'aspect', 'assault', 'asset', 'assist',
      'assume', 'asthma', 'athlete', 'atom', 'attack', 'attend', 'attitude', 'attract',
      'auction', 'audit', 'august', 'aunt', 'author', 'auto', 'autumn', 'average',
      'avocado', 'avoid', 'awake', 'aware', 'away', 'awesome', 'awful', 'awkward'
    ];

    const entropy = this.generateSeed(wordCount === 12 ? 16 : 32);
    const words: string[] = [];
    
    for (let i = 0; i < wordCount; i++) {
      const index = entropy[i % entropy.length] % wordList.length;
      words.push(wordList[index]);
    }
    
    return words.join(' ');
  }

  // Derive private key from mnemonic
  static derivePrivateKey(mnemonic: string, passphrase: string = ''): Buffer {
    const seed = pbkdf2Sync(mnemonic, 'mnemonic' + passphrase, 2048, 64, 'sha512');
    return seed.slice(0, 32);
  }

  // Generate wallet address from private key (simplified)
  static generateAddress(privateKey: Buffer, currency: string = 'BTC'): string {
    const hash = createHash('sha256').update(privateKey).digest();
    const addressHash = createHash('ripemd160').update(hash).digest();
    
    // Simplified address generation (in production, use proper address encoding)
    const prefix = currency === 'BTC' ? '1' : currency === 'ETH' ? '0x' : '3';
    return prefix + addressHash.toString('hex').substring(0, 32);
  }

  // Encrypt data with password
  static encrypt(data: string, password: string): string {
    const key = pbkdf2Sync(password, 'salt', 10000, 32, 'sha256');
    const iv = randomBytes(16);
    
    // Simple XOR encryption (in production, use AES)
    const encrypted = Buffer.from(data, 'utf8').map((byte, i) => 
      byte ^ key[i % key.length] ^ iv[i % iv.length]
    );
    
    return iv.toString('hex') + ':' + Buffer.from(encrypted).toString('hex');
  }

  // Decrypt data with password
  static decrypt(encryptedData: string, password: string): string {
    const [ivHex, dataHex] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(dataHex, 'hex');
    const key = pbkdf2Sync(password, 'salt', 10000, 32, 'sha256');
    
    const decrypted = encrypted.map((byte, i) => 
      byte ^ key[i % key.length] ^ iv[i % iv.length]
    );
    
    return Buffer.from(decrypted).toString('utf8');
  }

  // Validate address format
  static validateAddress(address: string, currency: string): boolean {
    if (!address) return false;
    
    switch (currency) {
      case 'BTC':
        return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address);
      case 'ETH':
        return /^0x[a-fA-F0-9]{40}$/.test(address);
      default:
        return address.length > 10 && address.length < 100;
    }
  }

  // Generate secure backup codes
  static generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = randomBytes(4).toString('hex').toUpperCase();
      codes.push(code.match(/.{1,4}/g)?.join('-') || code);
    }
    return codes;
  }
}