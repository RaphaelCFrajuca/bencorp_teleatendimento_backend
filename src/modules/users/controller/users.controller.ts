import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { Role } from '../enum/role.enum';
import { UsersService } from '../service/users.service';

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth()
@Roles(Role.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: 'Cria um novo usuário',
    description:
      'Este endpoint permite que um administrador crie um novo usuário no sistema. O usuário criado terá um e-mail, nome, senha e função (role) especificados no corpo da requisição.',
  })
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    description: 'Usuário criado com sucesso',
    type: UserResponseDto,
  })
  @ApiUnauthorizedResponse({
    description:
      'Não autorizado. O usuário precisa ser um administrador para criar novos usuários.',
  })
  @ApiConflictResponse({
    description: 'Conflito. O e-mail fornecido já está em uso por outro usuário.',
  })
  @ApiForbiddenResponse({
    description: 'Proibido. O usuário não tem permissão para criar novos usuários.',
  })
  create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.createUser(dto);
  }
}
