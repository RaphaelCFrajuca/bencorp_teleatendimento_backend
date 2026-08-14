import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { AccessToken } from 'livekit-server-sdk';
import { Logger } from 'nestjs-pino';

@Injectable()
export class LivekitAdapter {
  constructor(
    @Inject('LIVEKIT_API_KEY') private readonly apiKey: string,
    @Inject('LIVEKIT_API_SECRET') private readonly apiSecret: string,
    @Inject('LIVEKIT_URL') private readonly serverUrl: string,
    private readonly logger: Logger,
  ) {}

  async generateRoomToken(data: {
    consultationId: string;
    identity: string;
    participantRole: string;
    roomVersion: number;
    ttlSeconds: number;
  }): Promise<{ token: string; roomName: string; identity: string; serverUrl: string; expiresInSeconds: number }> {
    if (!this.apiKey || !this.apiSecret || !this.serverUrl) {
      this.logger.error('Configuração do LiveKit ausente');
      throw new InternalServerErrorException('Não foi possível emitir a credencial da sala.');
    }

    const roomName = `consultation:${data.consultationId}`;
    const token = new AccessToken(this.apiKey, this.apiSecret, {
      identity: data.identity,
      ttl: `${data.ttlSeconds}s`,
      metadata: JSON.stringify({
        consultationId: data.consultationId,
        roomVersion: data.roomVersion,
        role: data.participantRole,
      }),
    });

    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });

    const jwt = await token.toJwt();

    return {
      token: jwt,
      roomName,
      identity: data.identity,
      serverUrl: this.serverUrl,
      expiresInSeconds: data.ttlSeconds,
    };
  }
}
