import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateMedicalRecordDto {
  @ApiProperty({
    description: 'Diagnóstico',
    example: 'Hipertensão arterial',
    required: false,
  })
  @IsOptional()
  @IsString()
  diagnose?: string;

  @ApiProperty({
    description: 'Tratamento recomendado',
    example: 'Medicação anti-hipertensiva',
    required: false,
  })
  @IsOptional()
  @IsString()
  treatment?: string;

  @ApiProperty({
    description: 'Observações adicionais',
    example: 'Paciente apresentou melhora',
    required: false,
  })
  @IsOptional()
  @IsString()
  observations?: string;
}
