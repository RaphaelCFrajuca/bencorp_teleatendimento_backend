import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
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

  @Get()
  @ApiOperation({
    summary: 'Lista todos os usuários',
    description: 'Retorna a lista completa de usuários cadastrados no sistema.',
  })
  @ApiOkResponse({
    description: 'Lista de usuários retornada com sucesso.',
    type: [UserResponseDto],
  })
  @ApiUnauthorizedResponse({
    description: 'Não autorizado. O usuário precisa estar autenticado.',
  })
  @ApiForbiddenResponse({
    description: 'Proibido. O usuário não tem permissão para consultar usuários.',
  })
  getAllUsers(): Promise<UserResponseDto[]> {
    return this.usersService.getAllUsers();
  }

  @Get('email')
  @ApiOperation({
    summary: 'Busca um usuário pelo e-mail',
    description: 'Retorna os dados do usuário correspondente ao e-mail informado.',
  })
  @ApiOkResponse({
    description: 'Usuário encontrado com sucesso.',
    type: UserResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Não autorizado. O usuário precisa estar autenticado.',
  })
  @ApiForbiddenResponse({
    description: 'Proibido. O usuário não tem permissão para consultar usuários.',
  })
  @ApiQuery({ name: 'email', type: String, description: 'E-mail do usuário' })
  getUserByEmail(@Query('email') email: string): Promise<UserResponseDto | null> {
    return this.usersService.getUserByEmail(email);
  }

  @Get('name')
  @ApiOperation({
    summary: 'Busca um usuário pelo nome',
    description: 'Retorna os dados do usuário correspondente ao nome informado.',
  })
  @ApiOkResponse({
    description: 'Usuário encontrado com sucesso.',
    type: UserResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Não autorizado. O usuário precisa estar autenticado.',
  })
  @ApiForbiddenResponse({
    description: 'Proibido. O usuário não tem permissão para consultar usuários.',
  })
  @ApiQuery({ name: 'name', type: String, description: 'Nome do usuário' })
  getUserByName(@Query('name') name: string): Promise<UserResponseDto | null> {
    return this.usersService.getUserByName(name);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Busca um usuário por ID',
    description: 'Retorna os dados de um usuário específico a partir do seu identificador.',
  })
  @ApiOkResponse({
    description: 'Usuário encontrado com sucesso.',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Usuário não encontrado.',
  })
  @ApiUnauthorizedResponse({
    description: 'Não autorizado. O usuário precisa estar autenticado.',
  })
  @ApiForbiddenResponse({
    description: 'Proibido. O usuário não tem permissão para consultar usuários.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Identificador do usuário' })
  getUserById(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.getUserById(id);
  }

  @Get(':id/role')
  @ApiOperation({
    summary: 'Busca a role de um usuário',
    description: 'Retorna a função associada ao usuário informado.',
  })
  @ApiOkResponse({
    description: 'Role retornada com sucesso.',
    type: String,
  })
  @ApiNotFoundResponse({
    description: 'Usuário não encontrado.',
  })
  @ApiUnauthorizedResponse({
    description: 'Não autorizado. O usuário precisa estar autenticado.',
  })
  @ApiForbiddenResponse({
    description: 'Proibido. O usuário não tem permissão para consultar usuários.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Identificador do usuário' })
  getRoleByUserId(@Param('id') id: string): Promise<Role> {
    return this.usersService.getRoleByUserId(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualiza um usuário',
    description: 'Atualiza os dados de um usuário existente, incluindo senha, nome, e-mail e role.',
  })
  @ApiOkResponse({
    description: 'Usuário atualizado com sucesso.',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Usuário não encontrado.',
  })
  @ApiConflictResponse({
    description: 'Conflito. O e-mail informado já está em uso por outro usuário.',
  })
  @ApiUnauthorizedResponse({
    description: 'Não autorizado. O usuário precisa estar autenticado.',
  })
  @ApiForbiddenResponse({
    description: 'Proibido. O usuário não tem permissão para atualizar usuários.',
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos enviados na requisição.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Identificador do usuário' })
  updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto): Promise<UserResponseDto> {
    return this.usersService.updateUser(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Exclui um usuário',
    description: 'Remove um usuário do sistema pelo identificador informado.',
  })
  @ApiNoContentResponse({
    description: 'Usuário removido com sucesso.',
  })
  @ApiNotFoundResponse({
    description: 'Usuário não encontrado.',
  })
  @ApiUnauthorizedResponse({
    description: 'Não autorizado. O usuário precisa estar autenticado.',
  })
  @ApiForbiddenResponse({
    description: 'Proibido. O usuário não tem permissão para excluir usuários.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Identificador do usuário' })
  deleteUser(@Param('id') id: string): Promise<boolean> {
    return this.usersService.deleteUser(id);
  }
}
