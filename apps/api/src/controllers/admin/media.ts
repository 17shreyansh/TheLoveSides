import type { Request, Response, NextFunction } from 'express';
import { Media } from '../../models/Media.js';
import { sendSuccess, sendPaginated } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { createAuditLog } from '../../services/audit.service.js';

export async function listMedia(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    const query: any = {};
    if (req.query.folder) query.folder = req.query.folder;

    const [media, total] = await Promise.all([
      Media.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('uploadedBy', 'firstName lastName')
        .lean(),
      Media.countDocuments(query),
    ]);

    sendPaginated(res, media, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    });
  } catch (error) {
    next(error);
  }
}

export async function createMediaRecord(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { filename, originalFilename, mimetype, size, url, alt, folder } = req.body;

    const media = await Media.create({
      filename,
      originalFilename,
      mimetype,
      size,
      url,
      alt,
      folder,
      uploadedBy: req.user!.id,
    });

    await createAuditLog({
      action: 'media.upload',
      resource: 'Media',
      resourceId: media.id,
      details: { url },
      req,
    });

    sendSuccess({ res, data: media, message: 'Media record created successfully', statusCode: 201 });
  } catch (error) {
    next(error);
  }
}

export async function deleteMedia(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;

    const media = await Media.findByIdAndDelete(id);
    if (!media) {
      throw ApiError.notFound('Media not found');
    }

    await createAuditLog({
      action: 'media.delete',
      resource: 'Media',
      resourceId: id,
      details: { url: media.url },
      req,
    });

    // In a real application, you would also trigger a deletion from S3/GCP here.

    sendSuccess({ res, message: 'Media deleted successfully' });
  } catch (error) {
    next(error);
  }
}
