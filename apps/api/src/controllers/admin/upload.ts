import type { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { getPublicUrl, isVideoFile, saveVideo } from '../../services/storage.service.js';
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

    let filename, size, mimetype;
    
    if (isVideoFile(req.file)) {
      filename = await saveVideo(req.file.buffer, req.file.originalname);
      size = req.file.size;
      mimetype = req.file.mimetype;
    } else {
      const result = await optimizeAndSaveImage(req.file.buffer, req.file.originalname);
      filename = result.filename;
      size = result.size;
      mimetype = 'image/webp'; // We convert to webp
    }
    
    const url = getPublicUrl(filename);
    
    logger.info({ filename, url }, 'File uploaded successfully');

    sendSuccess({
      res,
      statusCode: 201,
      data: {
        url,
        filename,
        mimetype,
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
      
      let filename, size, mimetype;
      
      if (isVideoFile(file)) {
        filename = await saveVideo(file.buffer, file.originalname);
        size = file.size;
        mimetype = file.mimetype;
      } else {
        const result = await optimizeAndSaveImage(file.buffer, file.originalname);
        filename = result.filename;
        size = result.size;
        mimetype = 'image/webp';
      }
      
      return {
        url: getPublicUrl(filename),
        filename,
        mimetype,
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
