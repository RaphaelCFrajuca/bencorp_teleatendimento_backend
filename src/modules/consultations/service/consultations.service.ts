import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import type { ConsultationRepositoryInterface } from 'src/infra/database/interfaces/consultation.repository.interface';
import { ConsultationResponseDto } from '../dto/consultation-response.dto';
import { CreateConsultationDto } from '../dto/create-consultation.dto';
import { TransferToDoctorDto } from '../dto/transfer-to-doctor.dto';
import { Consultation } from '../entity/consultation.entity';
import { ConsultationStatus } from '../enum/consultation-status.enum';

@Injectable()
export class ConsultationsService {
  constructor(
    @Inject('CONSULTATION_REPOSITORY')
    private readonly consultationRepository: ConsultationRepositoryInterface,
    private readonly logger: Logger,
  ) {}

  private mapConsultationToResponse(consultation: Consultation): ConsultationResponseDto {
    return {
      id: consultation.id,
      patientId: consultation.patientId,
      professionalId: consultation.professionalId,
      status: consultation.status,
      transferredToId: consultation.transferredToId,
      createdAt: consultation.createdAt,
      updatedAt: consultation.updatedAt,
      finalisedAt: consultation.finalisedAt,
    };
  }

  async createConsultation(
    dto: CreateConsultationDto,
    professionalId: string,
  ): Promise<ConsultationResponseDto> {
    this.logger.log('Criando nova consulta', { patientId: dto.patientId, professionalId });

    const consultation = await this.consultationRepository.createConsultation({
      patientId: dto.patientId,
      professionalId,
      status: ConsultationStatus.AGUARDANDO,
      transferredToId: null,
    });

    this.logger.log(`Consulta criada com sucesso: ${consultation.id}`, { id: consultation.id });
    return this.mapConsultationToResponse(consultation);
  }

  async getConsultationById(id: string): Promise<ConsultationResponseDto> {
    this.logger.log(`Buscando consulta por ID: ${id}`, { id });
    const consultation = await this.consultationRepository.getConsultationById(id);

    if (!consultation) {
      this.logger.warn(`Consulta não encontrada para o ID: ${id}`, { id });
      throw new NotFoundException(`Atendimento com ID ${id} não encontrado.`);
    }

    return this.mapConsultationToResponse(consultation);
  }

  async listPendingQueue(skip: number = 0, limit: number = 50): Promise<ConsultationResponseDto[]> {
    this.logger.log(`Listando fila de espera`, { skip, limit });
    const consultations = await this.consultationRepository.listPendingQueue(skip, limit);
    return consultations.map((c) => this.mapConsultationToResponse(c));
  }

  async getConsultationsByProfessional(
    professionalId: string,
    status?: ConsultationStatus,
  ): Promise<ConsultationResponseDto[]> {
    this.logger.log(`Buscando atendimentos do profissional`, { professionalId, status });
    const consultations = await this.consultationRepository.getConsultationsByProfessional(
      professionalId,
      status,
    );
    return consultations.map((c) => this.mapConsultationToResponse(c));
  }

  async getConsultationsByPatient(
    patientId: string,
    professionalId: string,
    status?: ConsultationStatus,
  ): Promise<ConsultationResponseDto[]> {
    this.logger.log(`Buscando atendimentos por paciente`, { patientId, professionalId, status });
    const consultations = await this.consultationRepository.getConsultationsByPatient(
      patientId,
      professionalId,
      status,
    );
    return consultations.map((c) => this.mapConsultationToResponse(c));
  }

  async startConsultation(
    consultationId: string,
    professionalId: string,
  ): Promise<ConsultationResponseDto> {
    this.logger.log(`Iniciando atendimento`, { consultationId, professionalId });
    await this.consultationRepository.startConsultation(consultationId, professionalId);
    const consultation = await this.consultationRepository.getConsultationById(consultationId);

    if (!consultation) {
      throw new NotFoundException(`Atendimento com ID ${consultationId} não encontrado.`);
    }

    this.logger.log(`Atendimento iniciado com sucesso`, { consultationId });
    return this.mapConsultationToResponse(consultation);
  }

  async transferToDoctor(
    consultationId: string,
    dto: TransferToDoctorDto,
  ): Promise<ConsultationResponseDto> {
    this.logger.log(`Transferindo atendimento para médico`, {
      consultationId,
      doctorId: dto.doctorId,
    });

    const consultation = await this.consultationRepository.transferToDoctor(
      consultationId,
      dto.doctorId,
    );

    if (!consultation) {
      throw new NotFoundException(`Atendimento com ID ${consultationId} não encontrado.`);
    }

    this.logger.log(`Atendimento transferido com sucesso`, { consultationId });
    return this.mapConsultationToResponse(consultation);
  }

  async finalizeConsultation(consultationId: string): Promise<ConsultationResponseDto> {
    this.logger.log(`Finalizando atendimento`, { consultationId });

    const consultation = await this.consultationRepository.finalizeConsultation(consultationId);

    if (!consultation) {
      throw new NotFoundException(`Atendimento com ID ${consultationId} não encontrado.`);
    }

    this.logger.log(`Atendimento finalizado com sucesso`, { consultationId });
    return this.mapConsultationToResponse(consultation);
  }

  async cancelConsultation(consultationId: string): Promise<ConsultationResponseDto> {
    this.logger.log(`Cancelando atendimento`, { consultationId });

    const consultation = await this.consultationRepository.cancelConsultation(consultationId);

    if (!consultation) {
      throw new NotFoundException(`Atendimento com ID ${consultationId} não encontrado.`);
    }

    this.logger.log(`Atendimento cancelado com sucesso`, { consultationId });
    return this.mapConsultationToResponse(consultation);
  }
}
