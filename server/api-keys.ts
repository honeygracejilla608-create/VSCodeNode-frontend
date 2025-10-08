import crypto from "crypto";

// API Key generation utilities
export function generateApiKey(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = '';
  for (let i = 0; i < length; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

export function validateApiKeyFormat(key: string): boolean {
  // API keys should be alphanumeric, 32 characters long
  return /^[A-Za-z0-9]{32}$/.test(key);
}

export interface APIKeyData {
  id: string;
  key: string;
  hashedKey: string;
  userEmail: string;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
  lastUsed?: Date;
  usageCount: number;
}

export class APIKeyManager {
  private keys: Map<string, APIKeyData> = new Map();

  constructor() {
    // In production, load from database
    this.loadKeys();
  }

  private loadKeys() {
    // Load from storage (in production, this would be from database)
    // For now, this is just an in-memory store
  }

  generateKey(userEmail: string, expiresInHours = 24): APIKeyData {
    const key = generateApiKey();
    const hashedKey = hashApiKey(key);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (expiresInHours * 60 * 60 * 1000));

    const keyData: APIKeyData = {
      id: `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      key,
      hashedKey,
      userEmail,
      createdAt: now,
      expiresAt,
      isActive: true,
      usageCount: 0
    };

    this.keys.set(hashedKey, keyData);
    return keyData;
  }

  validateKey(hashedKey: string): APIKeyData | null {
    const keyData = this.keys.get(hashedKey);
    if (!keyData) return null;

    if (!keyData.isActive) return null;

    if (keyData.expiresAt < new Date()) {
      keyData.isActive = false;
      return null;
    }

    // Update usage stats
    keyData.lastUsed = new Date();
    keyData.usageCount++;

    return keyData;
  }

  revokeKey(hashedKey: string): boolean {
    const keyData = this.keys.get(hashedKey);
    if (keyData) {
      keyData.isActive = false;
      return true;
    }
    return false;
  }

  getUserKeys(userEmail: string): APIKeyData[] {
    return Array.from(this.keys.values())
      .filter(key => key.userEmail === userEmail);
  }

  getKeyById(id: string): APIKeyData | null {
    return Array.from(this.keys.values())
      .find(key => key.id === id) || null;
  }
}

// Global instance
export const apiKeyManager = new APIKeyManager();
