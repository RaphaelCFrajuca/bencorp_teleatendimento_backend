import { AuditAction } from 'src/modules/audit-logs/enum/audit-action.enum';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'audit_logs' })
export class AuditLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: false })
  userId: string;

  @Column({ name: 'user_role', type: 'varchar', nullable: false })
  userRole: string;

  @Column({ name: 'patient_id', type: 'uuid', nullable: false })
  patientId: string;

  @Column({ name: 'medical_record_id', type: 'uuid', nullable: true })
  medicalRecordId?: string;

  @Column({ name: 'action', type: 'varchar', nullable: false })
  action: AuditAction;

  @Column({ name: 'endpoint', type: 'varchar', nullable: false })
  endpoint: string;

  @Column({ name: 'method', type: 'varchar', nullable: false })
  method: string;

  @Column({ name: 'status_code', type: 'integer', nullable: false })
  statusCode: number;

  @Column({ name: 'ip_address', type: 'varchar', nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: false })
  createdAt: Date;
}
