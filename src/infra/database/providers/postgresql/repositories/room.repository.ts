import { Injectable } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import type { Database } from 'src/infra/database/interfaces/database.interface';
import { Consultation } from 'src/modules/consultations/entity/consultation.entity';
import { PatientLink } from 'src/modules/rooms/entity/patient-link.entity';
import { RoomRepositoryInterface } from 'src/modules/rooms/interface/room-repository.interface';
import { ConsultationEntity } from '../entities/consultation.entity';
import { PatientLinkEntity } from '../entities/patient-link.entity';

@Injectable()
export class RoomRepository implements RoomRepositoryInterface {
  constructor(
    private readonly database: Database,
    private readonly logger: Logger,
  ) {}

  private async getDataSource() {
    return this.database.connect();
  }

  async getConsultationForRoom(consultationId: string): Promise<Consultation | null> {
    const dataSource = await this.getDataSource();
    const consultation = await dataSource.getRepository(ConsultationEntity).findOne({
      where: { id: consultationId },
    });

    this.logger.log('Consulta de atendimento para sala', {
      consultationId,
      found: Boolean(consultation),
    });
    return consultation;
  }

  async createPatientLink(data: {
    consultationId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<PatientLink> {
    const dataSource = await this.getDataSource();
    const repository = dataSource.getRepository(PatientLinkEntity);
    const link = repository.create({
      consultationId: data.consultationId,
      tokenHash: data.tokenHash,
      expiresAt: data.expiresAt,
      usedAt: null,
    });

    return repository.save(link);
  }

  async getActivePatientLinkByHash(tokenHash: string): Promise<PatientLink | null> {
    const dataSource = await this.getDataSource();
    const now = new Date();
    const link = await dataSource
      .getRepository(PatientLinkEntity)
      .createQueryBuilder('pl')
      .where('pl.token_hash = :tokenHash', { tokenHash })
      .andWhere('pl.used_at IS NULL')
      .andWhere('pl.expires_at > :now', { now })
      .getOne();

    return link;
  }

  async consumePatientLinkByHash(tokenHash: string): Promise<PatientLink | null> {
    const dataSource = await this.getDataSource();
    const now = new Date();
    const result = await dataSource
      .getRepository(PatientLinkEntity)
      .createQueryBuilder()
      .update(PatientLinkEntity)
      .set({ usedAt: () => 'CURRENT_TIMESTAMP' })
      .where('token_hash = :tokenHash', { tokenHash })
      .andWhere('used_at IS NULL')
      .andWhere('expires_at > :now', { now })
      .returning('*')
      .execute();

    if ((result.affected ?? 0) === 0) {
      return null;
    }

    return result.raw[0] as PatientLink;
  }
}
