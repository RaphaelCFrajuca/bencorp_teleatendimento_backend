import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, Matches } from 'class-validator';
import { PatientStatus } from '../enum/patient-status.enum';

export class UpdatePatientDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Nome completo do paciente',
    example: 'João Silva',
    required: false,
  })
  name?: string;

  @IsOptional()
  @IsEmail()
  @ApiProperty({
    description: 'Email do paciente',
    example: 'patient@example.com',
    required: false,
  })
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/, {
    message: 'CPF deve estar no formato XX.XXX.XXX-XX ou XXXXXXXXXXX',
  })
  @ApiProperty({
    description: 'CPF do paciente com ou sem máscara',
    example: '123.456.789-00',
    required: false,
  })
  cpf?: string;

  @IsOptional()
  @IsEnum(PatientStatus, {
    message: `status deve ser um dos seguintes valores: ${Object.values(PatientStatus).join(', ')}`,
  })
  @ApiProperty({
    description: 'Status do paciente',
    enum: PatientStatus,
    required: false,
  })
  status?: PatientStatus;
}
