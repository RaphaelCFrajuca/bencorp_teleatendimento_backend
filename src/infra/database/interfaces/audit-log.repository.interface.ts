import { AuditAction } from 'src/modules/audit-logs/enum/audit-action.enum';
import { AuditLog } from 'src/modules/audit-logs/entity/audit-log.entity';

export interface AuditLogRepositoryInterface {
  createAuditLog(data: {
    userId: string;
    userRole: string;
    patientId: string;
    medicalRecordId?: string;
    action: AuditAction | string;
    endpoint: string;
    method: string;
    statusCode: number;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AuditLog>;

  getAuditLogsByPatient(patientId: string, limit?: number): Promise<AuditLog[]>;

  getAuditLogsByMedicalRecord(medicalRecordId: string, limit?: number): Promise<AuditLog[]>;

  getAuditLogsByUser(userId: string, limit?: number): Promise<AuditLog[]>;

  getAuditLogsInRange(startDate: Date, endDate: Date, limit?: number): Promise<AuditLog[]>;
}
