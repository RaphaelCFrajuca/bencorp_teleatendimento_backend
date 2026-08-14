import { Consultation } from 'src/modules/consultations/entity/consultation.entity';
import { ConsultationStatus } from 'src/modules/consultations/enum/consultation-status.enum';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'consultations' })
export class ConsultationEntity implements Consultation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'patient_id', type: 'uuid', nullable: false })
  patientId: string;

  @Column({ name: 'professional_id', type: 'uuid', nullable: false })
  professionalId: string;

  @Column({ name: 'status', type: 'enum', enum: ConsultationStatus, nullable: false, default: ConsultationStatus.AGUARDANDO })
  status: ConsultationStatus;

  @Column({ name: 'transferred_to_id', type: 'uuid', nullable: true })
  transferredToId: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: false })
  updatedAt: Date;

  @Column({ name: 'finalised_at', type: 'timestamp', nullable: true })
  finalisedAt: Date | null;
}
