import type { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { getPublicUrl } from '../../services/storage.service.js';
import { optimizeAndSaveImage } from '../../services/image.service.js';
import { logger } from '../../utils/logger.js';

/**
 * Handle single file upload
 */
export async function uploadSingle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file || !req.file.buffer) {
      throw ApiError.badRequest('No file uploaded');
    }

    const { filename, size } = await optimizeAndSaveImage(req.file.buffer, req.file.originalname);
    const url = getPublicUrl(filename);
    
    logger.info({ filename, url }, 'File uploaded and optimized successfully');

    sendSuccess({
      res,
      statusCode: 201,
      data: {
        url,
        filename,
        mimetype: 'image/webp', // We convert to webp
        size,
      },
      message: 'File uploaded successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle bulk file uploads
 */
export async function uploadBulk(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      throw ApiError.badRequest('No files uploaded');
    }

    const results = await Promise.all(files.map(async (file) => {
      if (!file.buffer) return null;
      const { filename, size } = await optimizeAndSaveImage(file.buffer, file.originalname);
      return {
        url: getPublicUrl(filename),
        filename,
        mimetype: 'image/webp',
        size,
      };
    }));
    
    const validResults = results.filter(Boolean);

    logger.info({ count: validResults.length }, 'Multiple files uploaded and optimized successfully');

    sendSuccess({
      res,
      statusCode: 201,
      data: validResults,
      message: `${validResults.length} files uploaded successfully`,
    });
  } catch (error) {
    next(error);
  }
}
