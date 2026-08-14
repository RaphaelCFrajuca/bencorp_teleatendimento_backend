import { ApiProperty } from '@nestjs/swagger';
import { PatientStatus } from '../enum/patient-status.enum';

export class PatientResponseDto {
  @ApiProperty({
    description: 'ID único do paciente',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Email do paciente',
  })
  email: string;

  @ApiProperty({
    description: 'Nome completo do paciente',
  })
  name: string;

  @ApiProperty({
    description: 'CPF do paciente (armazenado sem máscara)',
  })
  cpf: string;

  @ApiProperty({
    description: 'Status do paciente',
    enum: PatientStatus,
  })
  status: PatientStatus;

  @ApiProperty({
    description: 'Data de criação do registro',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização',
    format: 'date-time',
  })
  updatedAt: Date;
}
