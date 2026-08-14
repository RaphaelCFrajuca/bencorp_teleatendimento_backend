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
import { Role } from 'src/modules/users/enum/role.enum';
import { CreatePatientDto } from '../dto/create-patient.dto';
import { PatientResponseDto } from '../dto/patient-response.dto';
import { UpdatePatientDto } from '../dto/update-patient.dto';
import { PatientsService } from '../service/patients.service';

@Controller('patients')
@ApiTags('Patients')
@ApiBearerAuth()
@Roles(Role.ADMIN, Role.NURSE, Role.DOCTOR)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @ApiOperation({
    summary: 'Cria um novo paciente',
    description:
      'Este endpoint permite que um profissional autorizado (ADMIN, ENFERMEIRO ou MÉDICO) crie um novo paciente no sistema. O paciente terá e-mail, nome e CPF especificados no corpo da requisição.',
  })
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    description: 'Paciente criado com sucesso',
    type: PatientResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Não autorizado. O usuário precisa estar autenticado para criar pacientes.',
  })
  @ApiConflictResponse({
    description: 'Conflito. O e-mail ou CPF fornecido já está cadastrado.',
  })
  @ApiForbiddenResponse({
    description: 'Proibido. O usuário não tem permissão para criar pacientes.',
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos. Valide o formato de e-mail e CPF.',
  })
  create(@Body() dto: CreatePatientDto): Promise<PatientResponseDto> {
    return this.patientsService.createPatient(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lista pacientes',
    description: 'Retorna lista paginada de pacientes cadastrados no sistema.',
  })
  @ApiOkResponse({
    description: 'Lista de pacientes retornada com sucesso.',
    type: [PatientResponseDto],
  })
  @ApiUnauthorizedResponse({
    description: 'Não autorizado. O usuário precisa estar autenticado.',
  })
  @ApiForbiddenResponse({
    description: 'Proibido. O usuário não tem permissão para listar pacientes.',
  })
  @ApiQuery({
    name: 'skip',
    type: Number,
    required: false,
    description: 'Número de registros a pular (padrão: 0)',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Número máximo de registros a retornar (padrão: 50)',
  })
  listPatients(
    @Query('skip') skip: string = '0',
    @Query('limit') limit: string = '50',
  ): Promise<PatientResponseDto[]> {
    return this.patientsService.listPatients(parseInt(skip), parseInt(limit));
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Busca um paciente por ID',
    description: 'Retorna os dados de um paciente específico a partir do seu identificador.',
  })
  @ApiOkResponse({
    description: 'Paciente encontrado com sucesso.',
    type: PatientResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Paciente não encontrado.',
  })
  @ApiUnauthorizedResponse({
    description: 'Não autorizado. O usuário precisa estar autenticado.',
  })
  @ApiForbiddenResponse({
    description: 'Proibido. O usuário não tem permissão para consultar pacientes.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Identificador único do paciente',
  })
  getPatientById(@Param('id') id: string): Promise<PatientResponseDto> {
    return this.patientsService.getPatientById(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Atualiza um paciente',
    description:
      'Atualiza os dados de um paciente existente. Apenas administradores podem atualizar pacientes.',
  })
  @ApiOkResponse({
    description: 'Paciente atualizado com sucesso.',
    type: PatientResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Paciente não encontrado.',
  })
  @ApiConflictResponse({
    description: 'Conflito. O e-mail ou CPF informado já está cadastrado em outro paciente.',
  })
  @ApiUnauthorizedResponse({
    description: 'Não autorizado. O usuário precisa estar autenticado.',
  })
  @ApiForbiddenResponse({
    description: 'Proibido. Apenas administradores têm permissão para atualizar pacientes.',
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos enviados na requisição.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Identificador único do paciente',
  })
  updatePatient(
    @Param('id') id: string,
    @Body() dto: UpdatePatientDto,
  ): Promise<PatientResponseDto> {
    return this.patientsService.updatePatient(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Desativa um paciente',
    description:
      'Marca um paciente como inativo (soft delete). Apenas administradores podem desativar pacientes.',
  })
  @ApiNoContentResponse({
    description: 'Paciente desativado com sucesso.',
  })
  @ApiNotFoundResponse({
    description: 'Paciente não encontrado.',
  })
  @ApiUnauthorizedResponse({
    description: 'Não autorizado. O usuário precisa estar autenticado.',
  })
  @ApiForbiddenResponse({
    description: 'Proibido. Apenas administradores têm permissão para desativar pacientes.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Identificador único do paciente',
  })
  deactivatePatient(@Param('id') id: string): Promise<boolean> {
    return this.patientsService.deactivatePatient(id);
  }
}
