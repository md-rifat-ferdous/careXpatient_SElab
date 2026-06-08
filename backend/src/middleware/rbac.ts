import { Request, Response, NextFunction } from 'express';

export type Permission = 
  | 'VIEW_PATIENT' 
  | 'EDIT_PATIENT' 
  | 'ISSUE_PRESCRIPTION' 
  | 'ORDER_LAB_TEST' 
  | 'VIEW_AUDIT_LOGS' 
  | 'MANAGE_USERS'
  | 'VIEW_REPORTS';

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  Patient: ['VIEW_REPORTS'],
  Doctor: ['VIEW_PATIENT', 'EDIT_PATIENT', 'ISSUE_PRESCRIPTION', 'ORDER_LAB_TEST', 'VIEW_REPORTS'],
  Nurse: ['VIEW_PATIENT', 'ORDER_LAB_TEST', 'VIEW_REPORTS'],
  Lab: ['VIEW_PATIENT', 'ORDER_LAB_TEST', 'VIEW_REPORTS'],
  Admin: ['VIEW_PATIENT', 'EDIT_PATIENT', 'ISSUE_PRESCRIPTION', 'ORDER_LAB_TEST', 'VIEW_AUDIT_LOGS', 'MANAGE_USERS', 'VIEW_REPORTS']
};

export const checkPermission = (permission: Permission) => {
  return (req: any, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(401).json({ message: 'Unauthorized: No role identified' });
    }

    const permissions = ROLE_PERMISSIONS[userRole] || [];
    
    if (!permissions.includes(permission)) {
      return res.status(403).json({ 
        message: `Forbidden: Role '${userRole}' does not have '${permission}' permission` 
      });
    }

    next();
  };
};
