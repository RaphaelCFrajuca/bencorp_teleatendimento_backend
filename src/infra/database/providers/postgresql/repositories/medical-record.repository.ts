import { Injectable } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import type { Database } from '../../../interfaces/database.interface';
import { MedicalRecordRepositoryInterface } from '../../../interfaces/medical-record.repository.interface';
import { ConsultationEntity } from '../entities/consultation.entity';
import { MedicalRecordAppendixEntity } from '../entities/medical-record-appendix.entity';
import { MedicalRecordEntity } from '../entities/medical-record.entity';

@Injectable()
export class MedicalRecordRepository implements MedicalRecordRepositoryInterface {
  constructor(
    private readonly database: Database,
    private readonly logger: Logger,
  ) {}

  private async getRepository() {
    const dataSource = await this.database.connect();
    return dataSource.getRepository(MedicalRecordEntity);
  }

  private async getAppendixRepository() {
    const dataSource = await this.database.connect();
    return dataSource.getRepository(MedicalRecordAppendixEntity);
  }

  private async getConsultationRepository() {
    const dataSource = await this.database.connect();
    return dataSource.getRepository(ConsultationEntity);
  }

  async createMedicalRecord(data: {
    consultationId: string;
    professionalId: string;
    patientId: string;
    diagnose: string;
    treatment: string;
    observations?: string;
    status: string;
  }): Promise<any> {
    const repository = await this.getRepository();
    const record = repository.create({
      consultationId: data.consultationId,
      professionalId: data.professionalId,
      patientId: data.patientId,
      diagnose: data.diagnose,
      treatment: data.treatment,
      observations: data.observations,
      status: data.status,
    });

    const saved = await repository.save(record);

    this.logger.log('Medical record created', {
      medicalRecordId: saved.id,
      consultationId: data.consultationId,
      professionalId: data.professionalId,
    });

    return saved;
  }

  async getMedicalRecordById(id: string): Promise<any | null> {
    const repository = await this.getRepository();
    const record = await repository.findOne({
      where: { id },
    });

    if (!record) {
      this.logger.debug({ medicalRecordId: id }, 'Medical record not found');
      return null;
    }

    return record;
  }

  async getMedicalRecordByConsultationId(consultationId: string): Promise<any | null> {
    const repository = await this.getRepository();
    const record = await repository.findOne({
      where: { consultationId },
    });

    if (!record) {
      this.logger.debug({ consultationId }, 'Medical record not found for consultation');
      return null;
    }

    return record;
  }

  async updateMedicalRecord(
    id: string,
    data: Partial<{
      diagnose: string;
      treatment: string;
      observations: string;
      status: string;
    }>,
  ): Promise<any> {
    const repository = await this.getRepository();
    await repository.update({ id }, data);

    const updated = await repository.findOne({ where: { id } });

    this.logger.log('Medical record updated', {
      medicalRecordId: id,
    });

    return updated;
  }

  async createMedicalRecordAppendix(data: {
    medicalRecordId: string;
    professionalId: string;
    content: string;
    reason?: string;
  }): Promise<any> {
    const repository = await this.getAppendixRepository();
    const appendix = repository.create({
      medicalRecordId: data.medicalRecordId,
      professionalId: data.professionalId,
      content: data.content,
      reason: data.reason,
    });

    const saved = await repository.save(appendix);

    this.logger.log('Medical record appendix created', {
      appendixId: saved.id,
      medicalRecordId: data.medicalRecordId,
      professionalId: data.professionalId,
    });

    return saved;
  }

  async getMedicalRecordAppendices(medicalRecordId: string): Promise<any[]> {
    const repository = await this.getAppendixRepository();
    const appendices = await repository.find({
      where: { medicalRecordId },
      order: { createdAt: 'ASC' },
    });

    this.logger.debug(
      {
        medicalRecordId,
        count: appendices.length,
      },
      'Medical record appendices fetched',
    );

    return appendices;
  }

  async getConsultationById(
    consultationId: string,
  ): Promise<{ id: string; status: string; professionalId: string; patientId: string } | null> {
    const repository = await this.getConsultationRepository();
    const consultation = await repository.findOne({
      where: { id: consultationId },
    });

    if (!consultation) {
      this.logger.debug({ consultationId }, 'Consultation not found');
      return null;
    }

    return {
      id: consultation.id,
      status: consultation.status,
      professionalId: consultation.professionalId,
      patientId: consultation.patientId,
    };
  }
}
