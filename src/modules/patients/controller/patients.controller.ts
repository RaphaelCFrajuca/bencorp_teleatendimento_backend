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
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ConsultationResponseDto } from 'src/modules/consultations/dto/consultation-response.dto';
import { ConsultationsService } from 'src/modules/consultations/service/consultations.service';
import { MedicalRecordResponseDto } from 'src/modules/medical-records/dto/medical-record-response.dto';
import { MedicalRecordsService } from 'src/modules/medical-records/service/medical-records.service';
import { UserResponseDto } from 'src/modules/users/dto/user-response.dto';
import { Role } from 'src/modules/users/enum/role.enum';
import { CreatePatientDto } from '../dto/create-patient.dto';
import { PatientResponseDto } from '../dto/patient-response.dto';
import { UpdatePatientDto } from '../dto/update-patient.dto';
import { PatientsService } from '../service/patients.service';

@Controller('patients')
@ApiTags('Patients')
@ApiBearerAuth()
@Roles(Role.NURSE, Role.DOCTOR)
export class PatientsController {
  constructor(
    private readonly patientsService: PatientsService,
    private readonly consultationsService: ConsultationsService,
    private readonly medicalRecordsService: MedicalRecordsService,
  ) {}

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
  @Roles(Role.NURSE, Role.DOCTOR)
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

  @Get(':id/consultations')
  @Roles(Role.NURSE, Role.DOCTOR)
  @ApiOperation({
    summary: 'Lista atendimentos por paciente',
    description: 'Retorna atendimentos do paciente vinculados ao profissional autenticado.',
  })
  @ApiOkResponse({
    description: 'Atendimentos retornados com sucesso.',
    type: [ConsultationResponseDto],
  })
  @ApiUnauthorizedResponse({ description: 'Não autorizado.' })
  @ApiForbiddenResponse({ description: 'Proibido.' })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Identificador único do paciente',
  })
  async getPatientConsultations(
    @Param('id') id: string,
    @CurrentUser() user: UserResponseDto,
  ): Promise<ConsultationResponseDto[]> {
    return this.consultationsService.getConsultationsByPatient(id, user.id);
  }

  @Get(':id/medical-records')
  @Roles(Role.NURSE, Role.DOCTOR)
  @ApiOperation({
    summary: 'Lista prontuários por paciente',
    description: 'Retorna prontuários do paciente vinculados ao profissional autenticado.',
  })
  @ApiOkResponse({
    description: 'Prontuários retornados com sucesso.',
    type: [MedicalRecordResponseDto],
  })
  @ApiUnauthorizedResponse({ description: 'Não autorizado.' })
  @ApiForbiddenResponse({ description: 'Proibido.' })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Identificador único do paciente',
  })
  async getPatientMedicalRecords(
    @Param('id') id: string,
    @CurrentUser() user: UserResponseDto,
  ): Promise<MedicalRecordResponseDto[]> {
    return this.medicalRecordsService.getMedicalRecordsByPatient(id, user.id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.NURSE)
  @ApiOperation({
    summary: 'Atualiza um paciente',
    description: 'Atualiza os dados de um paciente existente.',
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
  @Roles(Role.ADMIN, Role.NURSE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Desativa um paciente',
    description: 'Marca um paciente como inativo (soft delete)',
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
