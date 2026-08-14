import { ConsultationStatus } from '../enum/consultation-status.enum';

export interface Consultation {
  id: string;
  patientId: string;
  professionalId: string;
  status: ConsultationStatus;
  transferredToId: string | null;
  createdAt: Date;
  updatedAt: Date;
  finalisedAt: Date | null;
}
