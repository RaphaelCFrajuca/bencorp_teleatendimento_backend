import { MedicalRecordStatus } from '../enum/medical-record-status.enum';

export interface MedicalRecord {
  id: string;
  consultationId: string;
  professionalId: string;
  patientId: string;
  status: MedicalRecordStatus;
  diagnose: string;
  treatment: string;
  observations?: string;
  createdAt: Date;
  updatedAt: Date;
}
