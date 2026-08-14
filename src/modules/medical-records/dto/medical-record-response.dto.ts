import { ApiProperty } from '@nestjs/swagger';
import { MedicalRecordStatus } from '../enum/medical-record-status.enum';

export class MedicalRecordResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  consultationId: string;

  @ApiProperty()
  professionalId: string;

  @ApiProperty()
  patientId: string;

  @ApiProperty({
    enum: ['rascunho', 'finalizado'],
  })
  status: MedicalRecordStatus;

  @ApiProperty()
  diagnose: string;

  @ApiProperty()
  treatment: string;

  @ApiProperty()
  observations?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
