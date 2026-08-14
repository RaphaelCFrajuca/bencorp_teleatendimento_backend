import { ApiProperty } from '@nestjs/swagger';

export class MedicalRecordAppendixResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  medicalRecordId: string;

  @ApiProperty()
  professionalId: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  reason?: string;

  @ApiProperty()
  createdAt: Date;
}
