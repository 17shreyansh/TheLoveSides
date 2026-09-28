import crypto from 'crypto';

/**
 * Generates a professional, collision-resistant SKU.
 * Format: [PREFIX]-[8 RANDOM ALPHANUMERIC CHARS]
 * Example: TLS-8F3A2B1C
 */
export function generateUniqueSKU(prefix: string = 'TLS'): string {
  // Generate 4 bytes and convert to hex (8 chars)
  const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
  
  if (!prefix) {
    return randomPart;
  }
  
  return `${prefix}-${randomPart}`;
}
