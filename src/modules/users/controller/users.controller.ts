import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { Role } from '../enum/role.enum';
import { UsersService } from '../service/users.service';

@Controller('users')
@Roles(Role.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.createUser(dto);
  }
}
