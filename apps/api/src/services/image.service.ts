import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Optimizes an image buffer using Sharp, converts it to WebP, and saves to disk.
 * Returns the generated filename and file size.
 */
export async function optimizeAndSaveImage(buffer: Buffer, _originalName: string): Promise<{ filename: string, size: number }> {
  // We'll generate a UUID and append -optimized.webp
  const filename = `${uuidv4()}-optimized.webp`;
  const filepath = path.join(uploadDir, filename);

  const info = await sharp(buffer)
    .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(filepath);

  return {
    filename,
    size: info.size
  };
}
