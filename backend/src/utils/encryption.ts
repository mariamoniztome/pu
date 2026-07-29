import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

// Access/refresh tokens and the iCloud app-specific password are the keys to
// a doctor's personal calendar account, so they're encrypted at rest rather
// than stored as plain strings like the rest of the schema.
function getKey(): Buffer {
  const raw = process.env.CALENDAR_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error('CALENDAR_ENCRYPTION_KEY is not configured');
  }
  const key = Buffer.from(raw, 'hex');
  if (key.length !== 32) {
    throw new Error('CALENDAR_ENCRYPTION_KEY must be a 32-byte key encoded as 64 hex characters');
  }
  return key;
}

export function encrypt(plainText: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString('hex'), authTag.toString('hex'), encrypted.toString('hex')].join(':');
}

export function decrypt(payload: string): string {
  const key = getKey();
  const [ivHex, authTagHex, dataHex] = payload.split(':');
  if (!ivHex || !authTagHex || !dataHex) {
    throw new Error('Malformed encrypted payload');
  }
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()]);
  return decrypted.toString('utf8');
}
