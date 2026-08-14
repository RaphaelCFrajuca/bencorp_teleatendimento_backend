import { PatientStatus } from '../enum/patient-status.enum';

export interface Patient {
  id: string;
  name: string;
  email: string;
  cpf: string;
  status: PatientStatus;
  createdAt: Date;
  updatedAt: Date;
}
