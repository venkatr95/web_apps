import crypto from 'crypto';

export const hashValue = (input: string): string => {
  return crypto.createHash('sha256').update(input).digest('hex');
};

export const base64Encode = (input: string): string => {
  return Buffer.from(input).toString('base64');
};

export const generateToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const verifyTimeHash = (timestamp: number, token: string): boolean => {
  const now = Date.now();
  return now - timestamp < 10 * 60 * 1000; // Valid for 10 minutes
};