import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MedicalRecordStatus } from 'src/modules/medical-records/enum/medical-record-status.enum';

@Entity('medical_records')
@Index('idx_medical_records_consultation_id', ['consultationId'])
@Index('idx_medical_records_professional_id', ['professionalId'])
@Index('idx_medical_records_patient_id', ['patientId'])
@Index('idx_medical_records_status', ['status'])
export class MedicalRecordEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  consultationId: string;

  @Column('uuid')
  professionalId: string;

  @Column('uuid')
  patientId: string;

  @Column('enum', {
    enum: ['rascunho', 'finalizado'],
    default: 'rascunho',
  })
  status: MedicalRecordStatus;

  @Column('text')
  diagnose: string;

  @Column('text')
  treatment: string;

  @Column('text', { nullable: true })
  observations?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
