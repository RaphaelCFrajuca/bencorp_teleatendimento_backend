import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMedicalRecordDto {
  @ApiProperty({
    description: 'UUID da consulta associada',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  consultationId: string;

  @ApiProperty({
    description: 'Diagnóstico',
    example: 'Hipertensão arterial',
  })
  @IsString()
  diagnose: string;

  @ApiProperty({
    description: 'Tratamento recomendado',
    example: 'Medicação anti-hipertensiva, acompanhamento em 30 dias',
  })
  @IsString()
  treatment: string;

  @ApiProperty({
    description: 'Observações adicionais',
    example: 'Paciente apresentou sintomas de fadiga',
    required: false,
  })
  @IsOptional()
  @IsString()
  observations?: string;
}
