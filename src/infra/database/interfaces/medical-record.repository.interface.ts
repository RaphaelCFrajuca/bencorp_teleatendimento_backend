import { MedicalRecordStatus } from 'src/modules/medical-records/enum/medical-record-status.enum';

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

export interface MedicalRecordAppendix {
  id: string;
  medicalRecordId: string;
  professionalId: string;
  content: string;
  reason?: string;
  createdAt: Date;
}

export interface MedicalRecordRepositoryInterface {
  createMedicalRecord(data: {
    consultationId: string;
    professionalId: string;
    patientId: string;
    diagnose: string;
    treatment: string;
    observations?: string;
    status: MedicalRecordStatus;
  }): Promise<MedicalRecord>;

  getMedicalRecordById(id: string): Promise<MedicalRecord | null>;

  getMedicalRecordByConsultationId(consultationId: string): Promise<MedicalRecord | null>;

  updateMedicalRecord(
    id: string,
    data: Partial<{
      diagnose: string;
      treatment: string;
      observations: string;
      status: MedicalRecordStatus;
    }>,
  ): Promise<MedicalRecord>;

  createMedicalRecordAppendix(data: {
    medicalRecordId: string;
    professionalId: string;
    content: string;
    reason?: string;
  }): Promise<MedicalRecordAppendix>;

  getMedicalRecordAppendices(medicalRecordId: string): Promise<MedicalRecordAppendix[]>;

  getConsultationById(
    consultationId: string,
  ): Promise<{ id: string; status: string; professionalId: string; patientId: string } | null>;
}
