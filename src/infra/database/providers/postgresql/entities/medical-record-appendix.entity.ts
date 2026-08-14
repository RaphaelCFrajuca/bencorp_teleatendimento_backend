import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('medical_record_appendices')
@Index('idx_medical_record_appendices_record_id', ['medicalRecordId'])
@Index('idx_medical_record_appendices_professional_id', ['professionalId'])
export class MedicalRecordAppendixEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  medicalRecordId: string;

  @Column('uuid')
  professionalId: string;

  @Column('text')
  content: string;

  @Column('text', { nullable: true })
  reason?: string;

  @CreateDateColumn()
  createdAt: Date;
}
