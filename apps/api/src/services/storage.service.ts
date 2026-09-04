import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

// Ensure the upload directory exists
const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up local memory storage
const storage = multer.memoryStorage();

// File filter to allow only specific mime types (images)
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(ApiError.badRequest('Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed.'));
  }
};

export const uploadService = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

/**
 * Utility function to convert an uploaded file path to a public URL.
 */
export function getPublicUrl(filename: string): string {
  // In development, return the localhost URL
  // In production, this would be the S3 or CDN URL if configured
  return `${env.API_URL}/uploads/${filename}`;
}
