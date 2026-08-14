import { Patient } from 'src/modules/patients/entity/patient.entity';
import { PatientStatus } from 'src/modules/patients/enum/patient-status.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'patients' })
export class PatientEntity implements Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name', type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ name: 'email', type: 'varchar', length: 255, nullable: false, unique: true })
  email: string;

  @Column({ name: 'cpf', type: 'varchar', length: 11, nullable: false, unique: true })
  cpf: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: PatientStatus,
    nullable: false,
    default: PatientStatus.ACTIVE,
  })
  status: PatientStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: false })
  updatedAt: Date;
}
