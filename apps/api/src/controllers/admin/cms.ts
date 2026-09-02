import type { Request, Response, NextFunction } from 'express';
import { CmsPage, CmsRevision } from '../../models/CmsPage.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { createAuditLog } from '../../services/audit.service.js';

export async function listCmsPages(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const pages = await CmsPage.find().select('title slug isPublished authorId createdAt updatedAt').lean();
    sendSuccess({ res, data: pages });
  } catch (error) {
    next(error);
  }
}

export async function getCmsPageById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const page = await CmsPage.findById(id).lean();
    if (!page) throw ApiError.notFound('CMS Page');
    sendSuccess({ res, data: page });
  } catch (error) {
    next(error);
  }
}

export async function createCmsPage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const pageData = { ...req.body, authorId: req.user!.id };
    // Assuming slug is auto-generated in pre-save or passed in
    const page = await CmsPage.create(pageData);

    await createAuditLog({
      action: 'cms.create',
      resource: 'CmsPage',
      resourceId: page.id,
      details: { slug: page.slug },
      req,
    });

    sendSuccess({ res, data: page, message: 'Page created successfully', statusCode: 201 });
  } catch (error) {
    next(error);
  }
}

export async function updateCmsPage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const page = await CmsPage.findById(id);
    if (!page) throw ApiError.notFound('CMS Page');

    Object.assign(page, req.body);
    
    // Auto-save history if content changed
    if (page.isModified('content') || page.isModified('title')) {
      await CmsRevision.create({
        pageId: page._id,
        content: page.content,
        title: page.title,
        editedBy: req.user!.id,
      });
    }

    await page.save();

    await createAuditLog({
      action: 'cms.update',
      resource: 'CmsPage',
      resourceId: id,
      details: { slug: page.slug },
      req,
    });

    sendSuccess({ res, data: page, message: 'Page updated successfully' });
  } catch (error) {
    next(error);
  }
}

export async function deleteCmsPage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const page = await CmsPage.findByIdAndDelete(id);
    if (!page) throw ApiError.notFound('CMS Page');

    await createAuditLog({
      action: 'cms.delete',
      resource: 'CmsPage',
      resourceId: id,
      details: { slug: page.slug },
      req,
    });

    sendSuccess({ res, message: 'Page deleted successfully' });
  } catch (error) {
    next(error);
  }
}
