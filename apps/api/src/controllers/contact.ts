import { Request, Response } from 'express';
import { ContactLead } from '../models/ContactLead.js';
import { sendSuccess, sendError } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

// Public endpoint: Submit a contact form lead
export const submitLead = async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;
    
    if (!name || !email || !message) {
      throw ApiError.badRequest('Name, email, and message are required');
    }

    const newLead = await ContactLead.create({
      name,
      email,
      subject,
      message
    });

    sendSuccess({
      res,
      statusCode: 201,
      data: newLead,
      message: 'Message sent successfully'
    });
  } catch (error: any) {
    const statusCode = error instanceof ApiError ? error.statusCode : 500;
    const code = error instanceof ApiError ? error.code : 'INTERNAL_SERVER_ERROR';
    sendError(res, statusCode, code, error.message || 'Server error');
  }
};

// Admin endpoint: Get all leads with pagination
export const getLeads = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status as string;

    const query: any = {};
    if (status) query.status = status;

    const leads = await ContactLead.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ContactLead.countDocuments(query);

    sendSuccess({
      res,
      data: {
        leads,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error: any) {
    const statusCode = error instanceof ApiError ? error.statusCode : 500;
    const code = error instanceof ApiError ? error.code : 'INTERNAL_SERVER_ERROR';
    sendError(res, statusCode, code, error.message || 'Server error');
  }
};

// Admin endpoint: Mark lead as read/unread
export const updateLeadStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['unread', 'read'].includes(status)) {
      throw ApiError.badRequest('Invalid status');
    }

    const lead = await ContactLead.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!lead) throw ApiError.notFound('Lead not found');

    sendSuccess({
      res,
      data: lead,
      message: 'Lead status updated'
    });
  } catch (error: any) {
    const statusCode = error instanceof ApiError ? error.statusCode : 500;
    const code = error instanceof ApiError ? error.code : 'INTERNAL_SERVER_ERROR';
    sendError(res, statusCode, code, error.message || 'Server error');
  }
};

// Admin endpoint: Delete a lead
export const deleteLead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const lead = await ContactLead.findByIdAndDelete(id);

    if (!lead) throw ApiError.notFound('Lead not found');

    sendSuccess({
      res,
      message: 'Lead deleted successfully'
    });
  } catch (error: any) {
    const statusCode = error instanceof ApiError ? error.statusCode : 500;
    const code = error instanceof ApiError ? error.code : 'INTERNAL_SERVER_ERROR';
    sendError(res, statusCode, code, error.message || 'Server error');
  }
};
