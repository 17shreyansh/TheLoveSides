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
  const baseId = uuidv4();
  const largeFilename = `${baseId}-large.webp`;
  const mediumFilename = `${baseId}-medium.webp`;
  const thumbFilename = `${baseId}-thumbnail.webp`;
  
  const largePath = path.join(uploadDir, largeFilename);
  const mediumPath = path.join(uploadDir, mediumFilename);
  const thumbPath = path.join(uploadDir, thumbFilename);

  // Large image (for product details & zoom)
  const info = await sharp(buffer)
    .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 75, effort: 6 }) // high effort for better compression
    .toFile(largePath);

  // Medium image (for category pages & general content)
  await sharp(buffer)
    .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 75, effort: 6 })
    .toFile(mediumPath);

  // Thumbnail image (for product cards & cart)
  await sharp(buffer)
    .resize({ width: 400, height: 400, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 70, effort: 6 })
    .toFile(thumbPath);

  return {
    filename: largeFilename,
    size: info.size
  };
}
