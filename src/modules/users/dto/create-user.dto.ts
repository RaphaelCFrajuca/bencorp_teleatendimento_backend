import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { Role } from '../enum/role.enum';

export class CreateUserDto {
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @MinLength(8)
  @ApiProperty()
  password: string;

  @IsEnum(Role, {
    message: `role deve ser um dos seguintes valores: ${Object.values(Role).join(', ')}`,
  })
  @ApiProperty()
  role: Role;
}
