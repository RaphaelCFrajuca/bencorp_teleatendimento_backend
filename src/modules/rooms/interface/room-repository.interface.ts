import { Consultation } from 'src/modules/consultations/entity/consultation.entity';
import { PatientLink } from '../entity/patient-link.entity';

export interface RoomRepositoryInterface {
  getConsultationForRoom(consultationId: string): Promise<Consultation | null>;
  createPatientLink(data: {
    consultationId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<PatientLink>;
  getActivePatientLinkByHash(tokenHash: string): Promise<PatientLink | null>;
  consumePatientLinkByHash(tokenHash: string): Promise<PatientLink | null>;
}
