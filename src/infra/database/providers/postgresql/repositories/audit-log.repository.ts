import { Injectable } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { AuditLogRepositoryInterface } from '../../../interfaces/audit-log.repository.interface';
import type { Database } from '../../../interfaces/database.interface';
import { AuditLogEntity } from '../entities/audit-log.entity';

@Injectable()
export class AuditLogRepository implements AuditLogRepositoryInterface {
  constructor(
    private readonly database: Database,
    private readonly logger: Logger,
  ) {}

  private async getRepository() {
    const dataSource = await this.database.connect();
    return dataSource.getRepository(AuditLogEntity);
  }

  async createAuditLog(data: {
    userId: string;
    userRole: string;
    patientId: string;
    medicalRecordId?: string;
    action: string;
    endpoint: string;
    method: string;
    statusCode: number;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<any> {
    const repository = await this.getRepository();
    const auditLog = repository.create({
      userId: data.userId,
      userRole: data.userRole,
      patientId: data.patientId,
      medicalRecordId: data.medicalRecordId,
      action: data.action,
      endpoint: data.endpoint,
      method: data.method,
      statusCode: data.statusCode,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    });

    const saved = await repository.save(auditLog);

    this.logger.log('Auditoria registrada', {
      auditLogId: saved.id,
      userId: data.userId,
      action: data.action,
      endpoint: data.endpoint,
    });

    return saved;
  }

  async getAuditLogsByPatient(patientId: string, limit: number = 100): Promise<any[]> {
    const repository = await this.getRepository();
    const logs = await repository.find({
      where: { patientId },
      order: { createdAt: 'DESC' },
      take: limit,
    });

    this.logger.debug(
      { patientId, count: logs.length },
      'Registros de auditoria recuperados por paciente',
    );
    return logs;
  }

  async getAuditLogsByMedicalRecord(medicalRecordId: string, limit: number = 100): Promise<any[]> {
    const repository = await this.getRepository();
    const logs = await repository.find({
      where: { medicalRecordId },
      order: { createdAt: 'DESC' },
      take: limit,
    });

    this.logger.debug(
      { medicalRecordId, count: logs.length },
      'Registros de auditoria recuperados por prontuário',
    );
    return logs;
  }

  async getAuditLogsByUser(userId: string, limit: number = 100): Promise<any[]> {
    const repository = await this.getRepository();
    const logs = await repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });

    this.logger.debug(
      { userId, count: logs.length },
      'Registros de auditoria recuperados por usuário',
    );
    return logs;
  }

  async getAuditLogsInRange(startDate: Date, endDate: Date, limit: number = 100): Promise<any[]> {
    const repository = await this.getRepository();
    const logs = await repository
      .createQueryBuilder('al')
      .where('al.created_at >= :startDate AND al.created_at <= :endDate', {
        startDate,
        endDate,
      })
      .orderBy('al.created_at', 'DESC')
      .take(limit)
      .getMany();

    this.logger.debug(
      { startDate, endDate, count: logs.length },
      'Registros de auditoria recuperados por intervalo de datas',
    );
    return logs;
  }
}
