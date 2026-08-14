import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import type { AuditLogRepositoryInterface } from 'src/infra/database/interfaces/audit-log.repository.interface';
import { AuditAction } from '../enum/audit-action.enum';

@Injectable()
export class AuditLogsService {
  constructor(
    @Inject('AUDIT_LOG_REPOSITORY')
    private readonly auditLogRepository: AuditLogRepositoryInterface,
    private readonly logger: Logger,
  ) {}

  async logMedicalRecordAccess(
    userId: string,
    userRole: string,
    patientId: string,
    action: AuditAction,
    endpoint: string,
    method: string,
    statusCode: number,
    medicalRecordId?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    try {
      await this.auditLogRepository.createAuditLog({
        userId,
        userRole,
        patientId,
        medicalRecordId,
        action,
        endpoint,
        method,
        statusCode,
        ipAddress,
        userAgent,
      });
    } catch (error) {
      this.logger.error(
        { error, userId, action, endpoint },
        'Erro ao registrar auditoria de acesso ao prontuário',
      );
    }
  }

  async getPatientAuditLogs(patientId: string, limit: number = 100) {
    this.logger.log('Buscando registros de auditoria do paciente', { patientId, limit });
    return this.auditLogRepository.getAuditLogsByPatient(patientId, limit);
  }

  async getMedicalRecordAuditLogs(medicalRecordId: string, limit: number = 100) {
    this.logger.log('Buscando registros de auditoria do prontuário', { medicalRecordId, limit });
    return this.auditLogRepository.getAuditLogsByMedicalRecord(medicalRecordId, limit);
  }

  async getUserAuditLogs(userId: string, limit: number = 100) {
    this.logger.log('Buscando registros de auditoria do usuário', { userId, limit });
    return this.auditLogRepository.getAuditLogsByUser(userId, limit);
  }

  async getAuditLogsInRange(startDate: Date, endDate: Date, limit: number = 100) {
    this.logger.log('Buscando registros de auditoria em intervalo', { startDate, endDate, limit });
    return this.auditLogRepository.getAuditLogsInRange(startDate, endDate, limit);
  }
}
