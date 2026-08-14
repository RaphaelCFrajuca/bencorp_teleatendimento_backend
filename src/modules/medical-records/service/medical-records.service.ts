import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import type { MedicalRecordRepositoryInterface } from 'src/infra/database/interfaces/medical-record.repository.interface';
import { CreateMedicalRecordAppendixDto } from '../dto/create-medical-record-appendix.dto';
import { CreateMedicalRecordDto } from '../dto/create-medical-record.dto';
import { MedicalRecordAppendixResponseDto } from '../dto/medical-record-appendix-response.dto';
import { MedicalRecordResponseDto } from '../dto/medical-record-response.dto';
import { UpdateMedicalRecordDto } from '../dto/update-medical-record.dto';
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
    private readonly medicalRecordRepository: MedicalRecordRepositoryInterface,
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
      'Criando prontuário médico',
    );

    const consultation = await this.medicalRecordRepository.getConsultationById(dto.consultationId);
    if (!consultation) {
      throw new NotFoundException('Consulta não encontrada');
    }

    if (consultation.status !== 'em_andamento') {
      throw new BadRequestException('Prontuário pode ser criado apenas para consulta em andamento');
    }

    if (consultation.professionalId !== professionalId) {
      throw new ForbiddenException('Apenas o profissional atribuído pode criar prontuário');
    }

    const existingRecord = await this.medicalRecordRepository.getMedicalRecordByConsultationId(
      dto.consultationId,
    );
    if (existingRecord) {
      throw new BadRequestException('Prontuário já existe para esta consulta');
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
      'Buscando prontuário',
    );

    const record = await this.medicalRecordRepository.getMedicalRecordById(id);
    if (!record) {
      throw new NotFoundException('Prontuário não encontrado');
    }

    if (professionalId && record.professionalId !== professionalId) {
      throw new ForbiddenException('Acesso negado a este prontuário');
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
      'Buscando prontuário por consulta',
    );

    const record =
      await this.medicalRecordRepository.getMedicalRecordByConsultationId(consultationId);
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
      'Atualizando prontuário',
    );

    const record = await this.medicalRecordRepository.getMedicalRecordById(id);
    if (!record) {
      throw new NotFoundException('Prontuário não encontrado');
    }

    if (record.professionalId !== professionalId) {
      throw new ForbiddenException('Apenas o criador pode atualizar este prontuário');
    }

    if (record.status === MedicalRecordStatus.FINALIZADO) {
      throw new BadRequestException('Não é possível atualizar prontuário finalizado');
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
      'Finalizando prontuário',
    );

    const record = await this.medicalRecordRepository.getMedicalRecordById(id);
    if (!record) {
      throw new NotFoundException('Prontuário não encontrado');
    }

    if (record.professionalId !== professionalId) {
      throw new ForbiddenException('Apenas o criador pode finalizar este prontuário');
    }

    if (record.status === MedicalRecordStatus.FINALIZADO) {
      throw new BadRequestException('Prontuário já está finalizado');
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
      'Adicionando apêndice ao prontuário',
    );

    const record = await this.medicalRecordRepository.getMedicalRecordById(medicalRecordId);
    if (!record) {
      throw new NotFoundException('Prontuário não encontrado');
    }

    if (record.status !== MedicalRecordStatus.FINALIZADO) {
      throw new BadRequestException(
        'Apêndice pode ser adicionado apenas a prontuários finalizados',
      );
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
      'Buscando apêndices do prontuário',
    );

    const record = await this.medicalRecordRepository.getMedicalRecordById(medicalRecordId);
    if (!record) {
      throw new NotFoundException('Medical record not found');
    }

    const appendices =
      await this.medicalRecordRepository.getMedicalRecordAppendices(medicalRecordId);

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
