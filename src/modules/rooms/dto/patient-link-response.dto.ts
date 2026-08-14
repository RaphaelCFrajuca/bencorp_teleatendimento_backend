import { ApiProperty } from '@nestjs/swagger';

export class PatientLinkResponseDto {
  @ApiProperty({
    description: 'Token opaco de acesso do paciente',
  })
  token: string;

  @ApiProperty({
    description: 'URL para o paciente solicitar credencial da sala',
  })
  accessUrl: string;

  @ApiProperty({
    description: 'Data de expiração do link',
    format: 'date-time',
  })
  expiresAt: Date;
}
