import { Consultation } from 'src/modules/consultations/entity/consultation.entity';
import { ConsultationStatus } from 'src/modules/consultations/enum/consultation-status.enum';

export interface ConsultationRepositoryInterface {
  createConsultation(
    consultation: Omit<
      Consultation,
      'id' | 'createdAt' | 'updatedAt' | 'finalisedAt' | 'roomVersion'
    >,
  ): Promise<Consultation>;
  getConsultationById(id: string): Promise<Consultation | null>;
  getConsultationsByProfessional(
    professionalId: string,
    status?: ConsultationStatus,
  ): Promise<Consultation[]>;
  listPendingQueue(skip?: number, limit?: number): Promise<Consultation[]>;
  startConsultation(consultationId: string, professionalId: string): Promise<boolean>;
  transferToDoctor(consultationId: string, doctorId: string): Promise<Consultation | null>;
  finalizeConsultation(consultationId: string): Promise<Consultation | null>;
  cancelConsultation(consultationId: string): Promise<Consultation | null>;
}
