import { Inject, Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { CreateMedicalRecordDto } from '../dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from '../dto/update-medical-record.dto';
import { CreateMedicalRecordAppendixDto } from '../dto/create-medical-record-appendix.dto';
import { MedicalRecordResponseDto } from '../dto/medical-record-response.dto';
import { MedicalRecordAppendixResponseDto } from '../dto/medical-record-appendix-response.dto';
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

@Injectable()
export class MedicalRecordsService {
  constructor(
    @Inject('MEDICAL_RECORD_REPOSITORY')
    private readonly medicalRecordRepository,
    private readonly logger: PinoLogger,
  ) {}

  private mapMedicalRecordToResponse(record: MedicalRecord): MedicalRecordResponseDto {
    return {
      id: record.id,
      consultationId: record.consultationId,
      professionalId: record.professionalId,
      patientId: record.patientId,
      status: record.status,
      diagnose: record.diagnose,
      treatment: record.treatment,
      observations: record.observations,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  async createMedicalRecord(
    dto: CreateMedicalRecordDto,
    professionalId: string,
  ): Promise<MedicalRecordResponseDto> {
    this.logger.info(
      {
        consultationId: dto.consultationId,
        professionalId,
      },
      'Creating medical record',
    );

    const consultation = await this.medicalRecordRepository.getConsultationById(dto.consultationId);
    if (!consultation) {
      throw new NotFoundException('Consultation not found');
    }

    if (consultation.status !== 'em_andamento') {
      throw new BadRequestException('Medical record can only be created for ongoing consultation');
    }

    if (consultation.professionalId !== professionalId) {
      throw new ForbiddenException('Only the assigned professional can create medical record');
    }

    const existingRecord = await this.medicalRecordRepository.getMedicalRecordByConsultationId(
      dto.consultationId,
    );
    if (existingRecord) {
      throw new BadRequestException('Medical record already exists for this consultation');
    }

    const record = await this.medicalRecordRepository.createMedicalRecord({
      consultationId: dto.consultationId,
      professionalId,
      patientId: consultation.patientId,
      diagnose: dto.diagnose,
      treatment: dto.treatment,
      observations: dto.observations,
      status: MedicalRecordStatus.RASCUNHO,
    });

    return this.mapMedicalRecordToResponse(record);
  }

  async getMedicalRecordById(
    id: string,
    professionalId?: string,
  ): Promise<MedicalRecordResponseDto> {
    this.logger.info(
      {
        medicalRecordId: id,
        professionalId,
      },
      'Fetching medical record',
    );

    const record = await this.medicalRecordRepository.getMedicalRecordById(id);
    if (!record) {
      throw new NotFoundException('Medical record not found');
    }

    if (professionalId && record.professionalId !== professionalId) {
      throw new ForbiddenException('Access denied to this medical record');
    }

    return this.mapMedicalRecordToResponse(record);
  }

  async getMedicalRecordByConsultationId(
    consultationId: string,
  ): Promise<MedicalRecordResponseDto | null> {
    this.logger.info(
      {
        consultationId,
      },
      'Fetching medical record by consultation',
    );

    const record = await this.medicalRecordRepository.getMedicalRecordByConsultationId(
      consultationId,
    );
    if (!record) {
      return null;
    }

    return this.mapMedicalRecordToResponse(record);
  }

  async updateMedicalRecord(
    id: string,
    dto: UpdateMedicalRecordDto,
    professionalId: string,
  ): Promise<MedicalRecordResponseDto> {
    this.logger.info(
      {
        medicalRecordId: id,
        professionalId,
      },
      'Updating medical record',
    );

    const record = await this.medicalRecordRepository.getMedicalRecordById(id);
    if (!record) {
      throw new NotFoundException('Medical record not found');
    }

    if (record.professionalId !== professionalId) {
      throw new ForbiddenException('Only the creator can update this medical record');
    }

    if (record.status === MedicalRecordStatus.FINALIZADO) {
      throw new BadRequestException('Cannot update finalized medical record');
    }

    const updated = await this.medicalRecordRepository.updateMedicalRecord(id, dto);
    return this.mapMedicalRecordToResponse(updated);
  }

  async finalizeMedicalRecord(
    id: string,
    professionalId: string,
  ): Promise<MedicalRecordResponseDto> {
    this.logger.info(
      {
        medicalRecordId: id,
        professionalId,
      },
      'Finalizing medical record',
    );

    const record = await this.medicalRecordRepository.getMedicalRecordById(id);
    if (!record) {
      throw new NotFoundException('Medical record not found');
    }

    if (record.professionalId !== professionalId) {
      throw new ForbiddenException('Only the creator can finalize this medical record');
    }

    if (record.status === MedicalRecordStatus.FINALIZADO) {
      throw new BadRequestException('Medical record is already finalized');
    }

    const updated = await this.medicalRecordRepository.updateMedicalRecord(id, {
      status: MedicalRecordStatus.FINALIZADO,
    });

    return this.mapMedicalRecordToResponse(updated);
  }

  async addAppendix(
    medicalRecordId: string,
    dto: CreateMedicalRecordAppendixDto,
    professionalId: string,
  ): Promise<MedicalRecordAppendixResponseDto> {
    this.logger.info(
      {
        medicalRecordId,
        professionalId,
      },
      'Adding appendix to medical record',
    );

    const record = await this.medicalRecordRepository.getMedicalRecordById(medicalRecordId);
    if (!record) {
      throw new NotFoundException('Medical record not found');
    }

    if (record.status !== MedicalRecordStatus.FINALIZADO) {
      throw new BadRequestException('Appendix can only be added to finalized medical records');
    }

    const appendix = await this.medicalRecordRepository.createMedicalRecordAppendix({
      medicalRecordId,
      professionalId,
      content: dto.content,
      reason: dto.reason,
    });

    return {
      id: appendix.id,
      medicalRecordId: appendix.medicalRecordId,
      professionalId: appendix.professionalId,
      content: appendix.content,
      reason: appendix.reason,
      createdAt: appendix.createdAt,
    };
  }

  async getMedicalRecordAppendices(
    medicalRecordId: string,
  ): Promise<MedicalRecordAppendixResponseDto[]> {
    this.logger.info(
      {
        medicalRecordId,
      },
      'Fetching medical record appendices',
    );

    const record = await this.medicalRecordRepository.getMedicalRecordById(medicalRecordId);
    if (!record) {
      throw new NotFoundException('Medical record not found');
    }

    const appendices = await this.medicalRecordRepository.getMedicalRecordAppendices(
      medicalRecordId,
    );

    return appendices.map((appendix) => ({
      id: appendix.id,
      medicalRecordId: appendix.medicalRecordId,
      professionalId: appendix.professionalId,
      content: appendix.content,
      reason: appendix.reason,
      createdAt: appendix.createdAt,
    }));
  }
}
