import type { Request, Response, NextFunction } from 'express';
import { Setting } from '../../models/Setting.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { createAuditLog } from '../../services/audit.service.js';

export async function listSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query: any = {};
    if (req.query.group) query.group = req.query.group;

    const settings = await Setting.find(query).sort({ group: 1, key: 1 }).lean();
    sendSuccess({ res, data: settings });
  } catch (error) {
    next(error);
  }
}

export async function updateSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { settings } = req.body; // Array of { key, value }

    if (!Array.isArray(settings)) {
      throw ApiError.badRequest('Settings must be an array');
    }

    const updatedSettings = [];
    for (const item of settings) {
      const isAlwaysPublic = ['returnPolicyDays', 'replacementPolicyDays', 'sitewideFreeShipping', 'freeShippingThreshold', 'shipping.estimatedDeliveryMin', 'shipping.estimatedDeliveryMax'].includes(item.key);

      const setting = await Setting.findOneAndUpdate(
        { key: item.key },
        { 
          $set: { 
            value: item.value,
            ...( isAlwaysPublic ? { isPublic: true } : {} ),
            ...( item.group ? { group: item.group } : {} )
          },
          $setOnInsert: { 
            group: item.group || (item.key.startsWith('theme.') ? 'theme' : 'general'),
            ...( !isAlwaysPublic ? { isPublic: item.key.startsWith('theme.') } : {} )
          }
        },
        { new: true, upsert: true }
      );
      if (setting) updatedSettings.push(setting);
    }

    await createAuditLog({
      action: 'setting.update',
      resource: 'Setting',
      resourceId: 'multiple',
      details: { keys: settings.map(s => s.key) },
      req,
    });

    sendSuccess({ res, data: updatedSettings, message: 'Settings updated successfully' });
  } catch (error) {
    next(error);
  }
}
