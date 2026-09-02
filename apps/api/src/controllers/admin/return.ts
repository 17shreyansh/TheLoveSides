import type { Request, Response, NextFunction } from 'express';
import { Return } from '../../models/Return.js';
import { sendSuccess, sendPaginated } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { createAuditLog } from '../../services/audit.service.js';

export async function listReturns(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    const query: any = {};
    if (req.query.status) query.status = req.query.status;

    const [returns, total] = await Promise.all([
      Return.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'email firstName lastName')
        .populate('orderId', 'orderNumber')
        .lean(),
      Return.countDocuments(query),
    ]);

    sendPaginated(res, returns, {
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

export async function getReturnById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const returnRequest = await Return.findById(id)
      .populate('userId', 'email firstName lastName phone')
      .populate('orderId', 'orderNumber status')
      .populate('variantId')
      .lean();

    if (!returnRequest) {
      throw ApiError.notFound('Return not found');
    }

    sendSuccess({ res, data: returnRequest });
  } catch (error) {
    next(error);
  }
}

export async function updateReturnStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const { status, adminNotes } = req.body;

    const returnRequest = await Return.findById(id);
    if (!returnRequest) {
      throw ApiError.notFound('Return not found');
    }

    returnRequest.status = status;
    if (adminNotes) {
      returnRequest.adminNotes = adminNotes;
    }

    if (['REFUNDED', 'REJECTED', 'CLOSED'].includes(status)) {
      returnRequest.resolvedAt = new Date();
    }

    await returnRequest.save();

    await createAuditLog({
      action: 'return.update_status',
      resource: 'Return',
      resourceId: id,
      details: { newStatus: status },
      req,
    });

    sendSuccess({ res, data: returnRequest, message: 'Return status updated successfully' });
  } catch (error) {
    next(error);
  }
}
