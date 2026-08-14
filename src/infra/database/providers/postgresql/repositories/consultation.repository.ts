import { ConflictException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import type { Database } from 'src/infra/database/interfaces/database.interface';
import { ConsultationRepositoryInterface } from 'src/infra/database/interfaces/consultation.repository.interface';
import { Consultation } from 'src/modules/consultations/entity/consultation.entity';
import { ConsultationStatus } from 'src/modules/consultations/enum/consultation-status.enum';
import { ConsultationEntity } from '../entities/consultation.entity';

@Injectable()
export class ConsultationRepository implements ConsultationRepositoryInterface {
  constructor(
    private readonly database: Database,
    private readonly logger: Logger,
  ) {}

  private async getRepository() {
    const dataSource = await this.database.connect();
    return dataSource.getRepository(ConsultationEntity);
  }

  async createConsultation(
    consultation: Omit<Consultation, 'id' | 'createdAt' | 'updatedAt' | 'finalisedAt'>,
  ): Promise<Consultation> {
    const repository = await this.getRepository();
    this.logger.log(`Criando atendimento: patientId=${consultation.patientId}, professionalId=${consultation.professionalId}`);
    return repository.save({
      ...consultation,
      status: ConsultationStatus.AGUARDANDO,
    });
  }

  async getConsultationById(id: string): Promise<Consultation | null> {
    const repository = await this.getRepository();
    this.logger.log(`Buscando atendimento por ID: ${id}`, { id });
    return repository.findOne({ where: { id } });
  }

  async getConsultationsByProfessional(
    professionalId: string,
    status?: ConsultationStatus,
  ): Promise<Consultation[]> {
    const repository = await this.getRepository();
    this.logger.log(`Buscando atendimentos do profissional: ${professionalId}`, { professionalId, status });
    const query = repository.createQueryBuilder('c').where('c.professional_id = :professionalId', { professionalId });

    if (status) {
      query.andWhere('c.status = :status', { status });
    }

    return query.orderBy('c.created_at', 'DESC').getMany();
  }

  async listPendingQueue(skip: number = 0, limit: number = 50): Promise<Consultation[]> {
    const repository = await this.getRepository();
    this.logger.log(`Listando fila de espera`, { skip, limit });
    return repository.find({
      where: { status: ConsultationStatus.AGUARDANDO },
      skip,
      take: limit,
      order: { createdAt: 'ASC' },
    });
  }

  async startConsultation(consultationId: string, professionalId: string): Promise<boolean> {
    const repository = await this.getRepository();
    this.logger.log(`Tentando iniciar atendimento`, { consultationId, professionalId });

    const professionalConsultationInProgress = await repository.findOne({
      where: { professionalId, status: ConsultationStatus.EM_ANDAMENTO },
    });

    if (professionalConsultationInProgress) {
      this.logger.warn(`Profissional já tem atendimento em andamento`, {
        consultationId,
        professionalId,
      });
      throw new ConflictException(
        'Profissional já possui um atendimento em andamento. Finalize-o antes de iniciar outro.',
      );
    }

    const result = await repository
      .createQueryBuilder()
      .update(ConsultationEntity)
      .set({ status: ConsultationStatus.EM_ANDAMENTO })
      .where('id = :id AND status = :statusEsperado', {
        id: consultationId,
        statusEsperado: ConsultationStatus.AGUARDANDO,
      })
      .execute();

    if ((result.affected ?? 0) === 0) {
      this.logger.warn(`Falha ao iniciar atendimento - race condition ou estado inválido`, {
        consultationId,
      });
      throw new ConflictException(
        'Atendimento já foi iniciado por outro profissional ou se encontra em estado inválido.',
      );
    }

    this.logger.log(`Atendimento iniciado com sucesso`, { consultationId, professionalId });
    return true;
  }

  async transferToDoctor(consultationId: string, doctorId: string): Promise<Consultation | null> {
    const repository = await this.getRepository();
    const consultation = await repository.findOne({ where: { id: consultationId } });

    if (!consultation) {
      this.logger.error(`Atendimento não encontrado para transferência: ${consultationId}`, { consultationId });
      throw new NotFoundException(`Atendimento com ID ${consultationId} não encontrado.`);
    }

    if (consultation.status !== ConsultationStatus.EM_ANDAMENTO) {
      this.logger.warn(`Tentativa de transferência com status inválido`, {
        consultationId,
        status: consultation.status,
      });
      throw new UnprocessableEntityException(
        'Apenas atendimentos em andamento podem ser transferidos para médico.',
      );
    }

    this.logger.log(`Transferindo atendimento para médico`, { consultationId, doctorId });
    await repository.update(consultationId, { transferredToId: doctorId });
    return repository.findOne({ where: { id: consultationId } });
  }

  async finalizeConsultation(consultationId: string): Promise<Consultation | null> {
    const repository = await this.getRepository();
    const consultation = await repository.findOne({ where: { id: consultationId } });

    if (!consultation) {
      this.logger.error(`Atendimento não encontrado para finalização: ${consultationId}`, { consultationId });
      throw new NotFoundException(`Atendimento com ID ${consultationId} não encontrado.`);
    }

    if (consultation.status !== ConsultationStatus.EM_ANDAMENTO) {
      this.logger.warn(`Tentativa de finalização com status inválido`, {
        consultationId,
        status: consultation.status,
      });
      throw new UnprocessableEntityException('Apenas atendimentos em andamento podem ser finalizados.');
    }

    this.logger.log(`Finalizando atendimento`, { consultationId });
    await repository.update(consultationId, {
      status: ConsultationStatus.FINALIZADO,
      finalisedAt: new Date(),
    });
    return repository.findOne({ where: { id: consultationId } });
  }

  async cancelConsultation(consultationId: string): Promise<Consultation | null> {
    const repository = await this.getRepository();
    const consultation = await repository.findOne({ where: { id: consultationId } });

    if (!consultation) {
      this.logger.error(`Atendimento não encontrado para cancelamento: ${consultationId}`, { consultationId });
      throw new NotFoundException(`Atendimento com ID ${consultationId} não encontrado.`);
    }

    if (consultation.status !== ConsultationStatus.AGUARDANDO) {
      this.logger.warn(`Tentativa de cancelamento com status inválido`, {
        consultationId,
        status: consultation.status,
      });
      throw new UnprocessableEntityException('Apenas atendimentos aguardando podem ser cancelados.');
    }

    this.logger.log(`Cancelando atendimento`, { consultationId });
    await repository.update(consultationId, { status: ConsultationStatus.CANCELADO });
    return repository.findOne({ where: { id: consultationId } });
  }
}
