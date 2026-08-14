import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/modules/users/enum/role.enum';
import { ConsultationResponseDto } from '../dto/consultation-response.dto';
import { CreateConsultationDto } from '../dto/create-consultation.dto';
import { TransferToDoctorDto } from '../dto/transfer-to-doctor.dto';
import { ConsultationsService } from '../service/consultations.service';

@Controller('consultations')
@ApiTags('Consultations')
@ApiBearerAuth()
@Roles(Role.ADMIN, Role.NURSE, Role.DOCTOR)
export class ConsultationsController {
  constructor(private readonly consultationsService: ConsultationsService) {}

  @Post()
  @ApiOperation({
    summary: 'Cria um novo atendimento',
    description: 'Cria um novo atendimento e o adiciona à fila de espera.',
  })
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    description: 'Atendimento criado com sucesso',
    type: ConsultationResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Não autorizado.',
  })
  @ApiForbiddenResponse({
    description: 'Proibido.',
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos.',
  })
  async create(
    @Body() dto: CreateConsultationDto,
    @CurrentUser() user: any,
  ): Promise<ConsultationResponseDto> {
    return this.consultationsService.createConsultation(dto, user.id);
  }

  @Get('queue')
  @ApiOperation({
    summary: 'Lista a fila de espera',
    description: 'Retorna atendimentos aguardando serem iniciados.',
  })
  @ApiOkResponse({
    description: 'Fila retornada com sucesso.',
    type: [ConsultationResponseDto],
  })
  @ApiUnauthorizedResponse({
    description: 'Não autorizado.',
  })
  @ApiForbiddenResponse({
    description: 'Proibido.',
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
  async listQueue(
    @Query('skip') skip: string = '0',
    @Query('limit') limit: string = '50',
  ): Promise<ConsultationResponseDto[]> {
    return this.consultationsService.listPendingQueue(parseInt(skip), parseInt(limit));
  }

  @Get('my')
  @ApiOperation({
    summary: 'Lista meus atendimentos',
    description: 'Retorna atendimentos do profissional autenticado.',
  })
  @ApiOkResponse({
    description: 'Atendimentos retornados com sucesso.',
    type: [ConsultationResponseDto],
  })
  @ApiUnauthorizedResponse({
    description: 'Não autorizado.',
  })
  async getMyConsultations(@CurrentUser() user: any): Promise<ConsultationResponseDto[]> {
    return this.consultationsService.getConsultationsByProfessional(user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Busca um atendimento por ID',
    description: 'Retorna os dados de um atendimento específico.',
  })
  @ApiOkResponse({
    description: 'Atendimento encontrado com sucesso.',
    type: ConsultationResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Atendimento não encontrado.',
  })
  @ApiUnauthorizedResponse({
    description: 'Não autorizado.',
  })
  @ApiForbiddenResponse({
    description: 'Proibido.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'ID do atendimento',
  })
  async getConsultationById(@Param('id') id: string): Promise<ConsultationResponseDto> {
    return this.consultationsService.getConsultationById(id);
  }

  @Post(':id/start')
  @ApiOperation({
    summary: 'Inicia um atendimento',
    description: 'Move um atendimento de AGUARDANDO para EM_ANDAMENTO.',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Atendimento iniciado com sucesso.',
    type: ConsultationResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Atendimento não encontrado.',
  })
  @ApiConflictResponse({
    description: 'Profissional já possui um atendimento em andamento ou race condition.',
  })
  @ApiUnauthorizedResponse({
    description: 'Não autorizado.',
  })
  @ApiForbiddenResponse({
    description: 'Proibido.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'ID do atendimento',
  })
  async startConsultation(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<ConsultationResponseDto> {
    return this.consultationsService.startConsultation(id, user.id);
  }

  @Post(':id/transfer-to-doctor')
  @Roles(Role.NURSE)
  @ApiOperation({
    summary: 'Transfere atendimento para médico',
    description: 'Transfere um atendimento em andamento de enfermeiro para médico.',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Atendimento transferido com sucesso.',
    type: ConsultationResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Atendimento não encontrado.',
  })
  @ApiUnprocessableEntityResponse({
    description: 'Atendimento não está em andamento.',
  })
  @ApiUnauthorizedResponse({
    description: 'Não autorizado.',
  })
  @ApiForbiddenResponse({
    description: 'Apenas enfermeiros podem transferir atendimentos.',
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'ID do atendimento',
  })
  async transferToDoctor(
    @Param('id') id: string,
    @Body() dto: TransferToDoctorDto,
  ): Promise<ConsultationResponseDto> {
    return this.consultationsService.transferToDoctor(id, dto);
  }

  @Post(':id/finalize')
  @ApiOperation({
    summary: 'Finaliza um atendimento',
    description: 'Move um atendimento de EM_ANDAMENTO para FINALIZADO.',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Atendimento finalizado com sucesso.',
    type: ConsultationResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Atendimento não encontrado.',
  })
  @ApiUnprocessableEntityResponse({
    description: 'Atendimento não está em andamento.',
  })
  @ApiUnauthorizedResponse({
    description: 'Não autorizado.',
  })
  @ApiForbiddenResponse({
    description: 'Proibido.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'ID do atendimento',
  })
  async finalizeConsultation(@Param('id') id: string): Promise<ConsultationResponseDto> {
    return this.consultationsService.finalizeConsultation(id);
  }

  @Post(':id/cancel')
  @ApiOperation({
    summary: 'Cancela um atendimento',
    description: 'Move um atendimento de AGUARDANDO para CANCELADO.',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Atendimento cancelado com sucesso.',
    type: ConsultationResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Atendimento não encontrado.',
  })
  @ApiUnprocessableEntityResponse({
    description: 'Atendimento não está em estado AGUARDANDO.',
  })
  @ApiUnauthorizedResponse({
    description: 'Não autorizado.',
  })
  @ApiForbiddenResponse({
    description: 'Proibido.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'ID do atendimento',
  })
  async cancelConsultation(@Param('id') id: string): Promise<ConsultationResponseDto> {
    return this.consultationsService.cancelConsultation(id);
  }
}
