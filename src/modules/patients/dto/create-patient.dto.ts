import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches } from 'class-validator';

export class CreatePatientDto {
  @IsEmail()
  @ApiProperty({
    description: 'Email do paciente',
    example: 'patient@example.com',
  })
  email: string;

  @IsString()
  @ApiProperty({
    description: 'Nome completo do paciente',
    example: 'João Silva',
  })
  name: string;

  @IsString()
  @Matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/, {
    message: 'CPF deve estar no formato XX.XXX.XXX-XX ou XXXXXXXXXXX',
  })
  @ApiProperty({
    description: 'CPF do paciente com ou sem máscara',
    example: '123.456.789-00',
  })
  cpf: string;
}
