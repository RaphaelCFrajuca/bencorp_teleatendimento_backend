import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { Role } from '../enum/role.enum';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum(Role, {
    message: `role deve ser um dos seguintes valores: ${Object.values(Role).join(', ')}`,
  })
  role: Role;
}
