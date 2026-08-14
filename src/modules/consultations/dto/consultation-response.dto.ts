import { ApiProperty } from '@nestjs/swagger';
import { ConsultationStatus } from '../enum/consultation-status.enum';

export class ConsultationResponseDto {
  @ApiProperty({
    description: 'ID único do atendimento',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'ID do paciente',
    format: 'uuid',
  })
  patientId: string;

  @ApiProperty({
    description: 'ID do profissional que iniciou o atendimento',
    format: 'uuid',
  })
  professionalId: string;

  @ApiProperty({
    description: 'Status do atendimento',
    enum: ConsultationStatus,
  })
  status: ConsultationStatus;

  @ApiProperty({
    description: 'ID do médico para quem foi transferido (se aplicável)',
    format: 'uuid',
    nullable: true,
  })
  transferredToId: string | null;

  @ApiProperty({
    description: 'Data de criação do atendimento',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização',
    format: 'date-time',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Data de finalização do atendimento',
    format: 'date-time',
    nullable: true,
  })
  finalisedAt: Date | null;
}
