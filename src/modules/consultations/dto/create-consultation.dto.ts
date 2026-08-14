import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateConsultationDto {
  @IsUUID()
  @ApiProperty({
    description: 'ID do paciente',
    format: 'uuid',
  })
  patientId: string;
}
