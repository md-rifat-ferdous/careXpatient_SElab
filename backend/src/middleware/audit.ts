import { Request, Response, NextFunction } from 'express';
import { AuditService } from '../services/audit.service';

export const auditMiddleware = (action: string) => {
  return async (req: any, res: Response, next: NextFunction) => {
    // Only log successful or relevant state-changing requests
    const originalSend = res.send;
    
    res.send = function (body) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.user?.id;
        const resourceId = req.params.id || req.body.id || req.query.id;
        const resourceType = req.baseUrl.split('/').pop();

        if (userId) {
          AuditService.log({
            userId: BigInt(userId),
            action,
            resource: `${resourceType}:${resourceId || 'LIST'}`,
            metadata: {
              method: req.method,
              url: req.originalUrl,
              status: res.statusCode,
              // Avoid logging sensitive body content directly, but maybe log field names
              fields: req.body ? Object.keys(req.body) : []
            },
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
          }).catch(err => console.error('Delayed Audit Log Error:', err));
        }
      }
      return originalSend.call(this, body);
    };

    next();
  };
};
