import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { Logger } from 'nestjs-pino';
import type { RoomRepositoryInterface } from 'src/modules/rooms/interface/room-repository.interface';

@Injectable()
export class RoomTokenGuard implements CanActivate {
  constructor(
    @Inject('ROOM_REPOSITORY') private readonly roomRepository: RoomRepositoryInterface,
    private readonly logger: Logger,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.params?.token;

    if (!token || typeof token !== 'string') {
      throw new ForbiddenException('Acesso à sala não permitido.');
    }

    const tokenHash = createHash('sha256').update(token).digest('hex');
    const link = await this.roomRepository.getActivePatientLinkByHash(tokenHash);

    if (!link) {
      this.logger.warn('Token opaco inválido para acesso de paciente', {
        route: request.url,
      });
      throw new ForbiddenException('Acesso à sala não permitido.');
    }

    request.patientLink = link;
    return true;
  }
}
