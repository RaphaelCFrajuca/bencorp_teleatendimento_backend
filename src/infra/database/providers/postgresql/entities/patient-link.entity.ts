import { PatientLink } from 'src/modules/rooms/entity/patient-link.entity';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'patient_links' })
export class PatientLinkEntity implements PatientLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'consultation_id', type: 'uuid', nullable: false })
  consultationId: string;

  @Column({ name: 'token_hash', type: 'varchar', nullable: false, unique: true })
  tokenHash: string;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: false })
  expiresAt: Date;

  @Column({ name: 'used_at', type: 'timestamp', nullable: true })
  usedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: false })
  createdAt: Date;
}
