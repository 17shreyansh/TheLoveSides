import { Request, Response, NextFunction } from 'express';
import { AttributeTemplate } from '../../models/AttributeTemplate.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';

export const listAttributeTemplates = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const templates = await AttributeTemplate.find().sort({ createdAt: -1 }).lean();
    sendSuccess({ res, data: templates });
  } catch (error) {
    next(error);
  }
};

export const createAttributeTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, attributes } = req.body;
    
    if (!name || !attributes || !Array.isArray(attributes)) {
      throw ApiError.badRequest('Invalid template data');
    }

    const template = new AttributeTemplate({
      name,
      attributes
    });

    await template.save();
    
    sendSuccess({ res, statusCode: 201, data: template, message: 'Template saved successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteAttributeTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const template = await AttributeTemplate.findByIdAndDelete(id);
    
    if (!template) {
      throw ApiError.notFound('Attribute Template');
    }
    
    sendSuccess({ res, data: template, message: 'Template deleted successfully' });
  } catch (error) {
    next(error);
  }
};
