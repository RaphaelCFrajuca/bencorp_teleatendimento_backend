import { AuditAction } from '../enum/audit-action.enum';

export interface AuditLog {
  id: string;
  userId: string;
  userRole: string;
  patientId: string;
  medicalRecordId?: string;
  action: AuditAction;
  endpoint: string;
  method: string;
  statusCode: number;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}
