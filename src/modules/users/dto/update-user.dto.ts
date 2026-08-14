import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '../enum/role.enum';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  @ApiProperty({ required: false })
  email?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @ApiProperty({ required: false })
  password?: string;

  @IsOptional()
  @IsEnum(Role, {
    message: `role deve ser um dos seguintes valores: ${Object.values(Role).join(', ')}`,
  })
  @ApiProperty({
    required: false,
    description: 'Função do usuário',
    enum: Role,
  })
  role?: Role;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ required: false })
  active?: boolean;
}
