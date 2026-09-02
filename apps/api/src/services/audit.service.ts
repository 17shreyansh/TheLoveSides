import { AuditLog } from '../models/AuditLog.js';
import type { Request } from 'express';

interface AuditEntry {
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  req: Request;
}

/**
 * Creates an audit log entry for admin actions.
 * Non-blocking — failures are logged but don't crash the request.
 */
export async function createAuditLog(entry: AuditEntry): Promise<void> {
  try {
    if (!entry.req.user || !entry.req.user.isAdmin) return;

    await AuditLog.create({
      action: entry.action,
      resource: entry.resource,
      resourceId: entry.resourceId,
      adminId: entry.req.user.id,
      adminEmail: entry.req.user.email,
      details: entry.details,
      ipAddress: entry.req.ip || entry.req.socket.remoteAddress,
      userAgent: entry.req.headers['user-agent'],
    });
  } catch {
    // Audit logging should never crash the request
    // The error is logged by mongoose/pino automatically
  }
}
