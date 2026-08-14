import { ApiProperty } from '@nestjs/swagger';

export class RoomTokenResponseDto {
  @ApiProperty({
    description: 'Token de acesso ao LiveKit',
  })
  token: string;

  @ApiProperty({
    description: 'Nome da sala no provedor de vídeo',
  })
  roomName: string;

  @ApiProperty({
    description: 'Identidade do participante no provedor de vídeo',
  })
  identity: string;

  @ApiProperty({
    description: 'URL do servidor LiveKit',
  })
  serverUrl: string;

  @ApiProperty({
    description: 'Tempo de expiração do token em segundos',
  })
  expiresInSeconds: number;
}
