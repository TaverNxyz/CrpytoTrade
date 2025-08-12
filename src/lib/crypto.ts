// Browser-compatible crypto utility functions for wallet management
export class CryptoUtils {
  // Generate a secure random seed using Web Crypto API
  static generateSeed(length: number = 32): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(length));
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

  // Browser-compatible hash function using Web Crypto API
  static async sha256(data: string | Uint8Array): Promise<Uint8Array> {
    const buffer = typeof data === 'string' ? new TextEncoder().encode(data) : data;
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    return new Uint8Array(hashBuffer);
  }

  // Simple PBKDF2 implementation using Web Crypto API
  static async pbkdf2(password: string, salt: string, iterations: number, keyLength: number): Promise<Uint8Array> {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: enc.encode(salt),
        iterations,
        hash: 'SHA-256'
      },
      keyMaterial,
      keyLength * 8
    );

    return new Uint8Array(derivedBits);
  }

  // Derive private key from mnemonic (async version)
  static async derivePrivateKey(mnemonic: string, passphrase: string = ''): Promise<Uint8Array> {
    const seed = await this.pbkdf2(mnemonic, 'mnemonic' + passphrase, 2048, 64);
    return seed.slice(0, 32);
  }

  // Generate wallet address from private key (simplified)
  static async generateAddress(privateKey: Uint8Array, currency: string = 'BTC'): Promise<string> {
    const hash = await this.sha256(privateKey);
    
    // Simplified address generation (in production, use proper address encoding)
    const prefix = currency === 'BTC' ? '1' : currency === 'ETH' ? '0x' : '3';
    const addressHash = Array.from(hash.slice(0, 16))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return prefix + addressHash;
  }

  // Simple XOR encryption (for demo purposes)
  static async encrypt(data: string, password: string): Promise<string> {
    const key = await this.pbkdf2(password, 'salt', 10000, 32);
    const iv = this.generateSeed(16);
    
    // Simple XOR encryption (in production, use AES)
    const dataBytes = new TextEncoder().encode(data);
    const encrypted = dataBytes.map((byte, i) => 
      byte ^ key[i % key.length] ^ iv[i % iv.length]
    );
    
    const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
    const encryptedHex = Array.from(encrypted).map(b => b.toString(16).padStart(2, '0')).join('');
    
    return ivHex + ':' + encryptedHex;
  }

  // Simple XOR decryption
  static async decrypt(encryptedData: string, password: string): Promise<string> {
    const [ivHex, dataHex] = encryptedData.split(':');
    const iv = new Uint8Array(ivHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);
    const encrypted = new Uint8Array(dataHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);
    const key = await this.pbkdf2(password, 'salt', 10000, 32);
    
    const decrypted = encrypted.map((byte, i) => 
      byte ^ key[i % key.length] ^ iv[i % iv.length]
    );
    
    return new TextDecoder().decode(decrypted);
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
      const bytes = this.generateSeed(4);
      const code = Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase();
      codes.push(code.match(/.{1,4}/g)?.join('-') || code);
    }
    return codes;
  }
}