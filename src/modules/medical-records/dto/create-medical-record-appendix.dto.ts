import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMedicalRecordAppendixDto {
  @ApiProperty({
    description: 'Conteúdo do adendo',
    example: 'Paciente retornou com queixa de dor de cabeça intensa',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Motivo da correção',
    example: 'Informação adicional omitida',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
