import { Patient } from 'src/modules/patients/entity/patient.entity';

export interface PatientRepositoryInterface {
  createPatient(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient>;
  getPatientById(id: string): Promise<Patient | null>;
  getPatientByEmail(email: string): Promise<Patient | null>;
  getPatientByCpf(cpf: string): Promise<Patient | null>;
  listPatients(skip?: number, limit?: number): Promise<Patient[]>;
  updatePatient(id: string, patient: Partial<Patient>): Promise<Patient | null>;
  softDeletePatient(id: string): Promise<boolean>;
}
