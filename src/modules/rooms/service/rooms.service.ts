import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { Logger } from 'nestjs-pino';
import { ConsultationStatus } from 'src/modules/consultations/enum/consultation-status.enum';
import { UserResponseDto } from 'src/modules/users/dto/user-response.dto';
import { LivekitAdapter } from '../adapter/livekit.adapter';
import { PatientLinkResponseDto } from '../dto/patient-link-response.dto';
import { RoomTokenResponseDto } from '../dto/room-token-response.dto';
import type { RoomRepositoryInterface } from '../interface/room-repository.interface';

@Injectable()
export class RoomsService {
  private readonly professionalTokenTtlSeconds = 900;
  private readonly patientTokenTtlSeconds = 900;
  private readonly patientLinkTtlMinutes = 30;

  constructor(
    @Inject('ROOM_REPOSITORY') private readonly roomRepository: RoomRepositoryInterface,
    private readonly livekitAdapter: LivekitAdapter,
    private readonly logger: Logger,
  ) {}

  private async assertConsultationStillActive(
    consultationId: string,
    expectedRoomVersion: number,
  ): Promise<void> {
    const current = await this.roomRepository.getConsultationForRoom(consultationId);
    if (
      !current ||
      current.status !== ConsultationStatus.EM_ANDAMENTO ||
      current.roomVersion !== expectedRoomVersion
    ) {
      throw new ForbiddenException('Acesso à sala não permitido.');
    }
  }

  async generateProfessionalToken(
    consultationId: string,
    authenticatedUser: UserResponseDto,
  ): Promise<RoomTokenResponseDto> {
    const consultation = await this.roomRepository.getConsultationForRoom(consultationId);

    if (!consultation) {
      this.logger.warn('Atendimento não encontrado para emissão de token profissional', {
        consultationId,
        userId: authenticatedUser.id,
      });
      throw new NotFoundException('Atendimento não encontrado.');
    }

    if (consultation.status !== ConsultationStatus.EM_ANDAMENTO) {
      this.logger.warn('Atendimento em estado inválido para emissão de token profissional', {
        consultationId,
        status: consultation.status,
        userId: authenticatedUser.id,
      });
      throw new ConflictException('Atendimento indisponível para acesso à sala.');
    }

    const assignedProfessionalId = consultation.transferredToId || consultation.professionalId;
    if (assignedProfessionalId !== authenticatedUser.id) {
      this.logger.warn('Profissional sem vínculo ao atendimento tentou emitir token', {
        consultationId,
        userId: authenticatedUser.id,
      });
      throw new ForbiddenException('Acesso à sala não permitido.');
    }

    const participantIdentity = `${authenticatedUser.role}:${authenticatedUser.id}`;
    await this.assertConsultationStillActive(consultation.id, consultation.roomVersion);
    const token = await this.livekitAdapter.generateRoomToken({
      consultationId,
      identity: participantIdentity,
      participantRole: authenticatedUser.role,
      roomVersion: consultation.roomVersion,
      ttlSeconds: this.professionalTokenTtlSeconds,
    });

    this.logger.log('Token profissional emitido para sala', {
      consultationId,
      userId: authenticatedUser.id,
      role: authenticatedUser.role,
      result: 'success',
    });

    return token;
  }

  async createPatientLink(
    consultationId: string,
    authenticatedUser: UserResponseDto,
  ): Promise<PatientLinkResponseDto> {
    const consultation = await this.roomRepository.getConsultationForRoom(consultationId);

    if (!consultation) {
      this.logger.warn('Atendimento não encontrado para criação de link de paciente', {
        consultationId,
        userId: authenticatedUser.id,
      });
      throw new NotFoundException('Atendimento não encontrado.');
    }

    if (consultation.status !== ConsultationStatus.EM_ANDAMENTO) {
      this.logger.warn('Atendimento em estado inválido para criação de link de paciente', {
        consultationId,
        status: consultation.status,
        userId: authenticatedUser.id,
      });
      throw new ConflictException('Atendimento indisponível para acesso à sala.');
    }

    const assignedProfessionalId = consultation.transferredToId || consultation.professionalId;
    if (assignedProfessionalId !== authenticatedUser.id) {
      this.logger.warn('Profissional sem vínculo ao atendimento tentou criar link de paciente', {
        consultationId,
        userId: authenticatedUser.id,
      });
      throw new ForbiddenException('Acesso à sala não permitido.');
    }

    const opaqueToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(opaqueToken).digest('hex');
    const expiresAt = new Date(Date.now() + this.patientLinkTtlMinutes * 60 * 1000);

    await this.roomRepository.createPatientLink({
      consultationId,
      tokenHash,
      expiresAt,
    });

    this.logger.log('Link de paciente gerado para sala', {
      consultationId,
      userId: authenticatedUser.id,
      result: 'success',
    });

    return {
      token: opaqueToken,
      accessUrl: `/rooms/patient-links/${opaqueToken}/token`,
      expiresAt,
    };
  }

  async generatePatientToken(opaqueToken: string): Promise<RoomTokenResponseDto> {
    const tokenHash = createHash('sha256').update(opaqueToken).digest('hex');
    const activeLink = await this.roomRepository.getActivePatientLinkByHash(tokenHash);

    if (!activeLink) {
      this.logger.warn('Falha na emissão de token do paciente por token opaco inválido', {
        result: 'forbidden',
      });
      throw new ForbiddenException('Acesso à sala não permitido.');
    }

    const consultation = await this.roomRepository.getConsultationForRoom(
      activeLink.consultationId,
    );
    if (!consultation || consultation.status !== ConsultationStatus.EM_ANDAMENTO) {
      this.logger.warn('Falha na emissão de token do paciente por atendimento indisponível', {
        consultationId: activeLink.consultationId,
        result: 'forbidden',
      });
      throw new ForbiddenException('Acesso à sala não permitido.');
    }

    const participantIdentity = `patient:${consultation.patientId}`;
    await this.assertConsultationStillActive(consultation.id, consultation.roomVersion);
    const token = await this.livekitAdapter.generateRoomToken({
      consultationId: consultation.id,
      identity: participantIdentity,
      participantRole: 'patient',
      roomVersion: consultation.roomVersion,
      ttlSeconds: this.patientTokenTtlSeconds,
    });

    const consumedLink = await this.roomRepository.consumePatientLinkByHash(tokenHash);
    if (!consumedLink) {
      this.logger.warn('Falha na emissão de token do paciente por consumo concorrente do link', {
        consultationId: consultation.id,
        result: 'forbidden',
      });
      throw new ForbiddenException('Acesso à sala não permitido.');
    }

    this.logger.log('Token de paciente emitido para sala', {
      consultationId: consultation.id,
      patientId: consultation.patientId,
      result: 'success',
    });

    return token;
  }
}
