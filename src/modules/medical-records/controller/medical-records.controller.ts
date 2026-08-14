import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../users/enum/role.enum';
import { CreateMedicalRecordAppendixDto } from '../dto/create-medical-record-appendix.dto';
import { CreateMedicalRecordDto } from '../dto/create-medical-record.dto';
import { MedicalRecordAppendixResponseDto } from '../dto/medical-record-appendix-response.dto';
import { MedicalRecordResponseDto } from '../dto/medical-record-response.dto';
import { UpdateMedicalRecordDto } from '../dto/update-medical-record.dto';
import { MedicalRecordsService } from '../service/medical-records.service';

@Controller('medical-records')
@ApiBearerAuth()
@Roles(Role.DOCTOR, Role.NURSE)
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Post()
  @Roles(Role.DOCTOR)
  @ApiOperation({
    summary: 'Criar prontuário médico',
    description:
      'Criar um novo prontuário para uma consulta em andamento. Apenas médicos podem criar.',
  })
  @ApiResponse({
    status: 201,
    description: 'Prontuário criado',
    type: MedicalRecordResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Status de consulta inválido ou prontuário já existe',
  })
  @ApiResponse({
    status: 403,
    description: 'Apenas o profissional atribuído pode criar',
  })
  @ApiResponse({
    status: 404,
    description: 'Consulta não encontrada',
  })
  async create(
    @Body() dto: CreateMedicalRecordDto,
    @CurrentUser() user: { sub: string },
  ): Promise<MedicalRecordResponseDto> {
    return this.medicalRecordsService.createMedicalRecord(dto, user.sub);
  }

  @Get(':id')
  @Roles(Role.DOCTOR, Role.NURSE)
  @ApiOperation({
    summary: 'Obter prontuário por ID',
    description:
      'Recuperar um prontuário específico. Médicos podem acessar seus próprios prontuários.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do prontuário médico',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Prontuário encontrado',
    type: MedicalRecordResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado',
  })
  @ApiResponse({
    status: 404,
    description: 'Prontuário não encontrado',
  })
  async getById(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string },
  ): Promise<MedicalRecordResponseDto> {
    return this.medicalRecordsService.getMedicalRecordById(id, user.sub);
  }

  @Patch(':id')
  @Roles(Role.DOCTOR)
  @ApiOperation({
    summary: 'Atualizar prontuário',
    description:
      'Atualizar um prontuário existente. Não é possível atualizar prontuários finalizados.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do prontuário médico',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Prontuário atualizado',
    type: MedicalRecordResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Não é possível atualizar prontuário finalizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Apenas o criador pode atualizar',
  })
  @ApiResponse({
    status: 404,
    description: 'Prontuário não encontrado',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMedicalRecordDto,
    @CurrentUser() user: { sub: string },
  ): Promise<MedicalRecordResponseDto> {
    return this.medicalRecordsService.updateMedicalRecord(id, dto, user.sub);
  }

  @Post(':id/finalize')
  @Roles(Role.DOCTOR)
  @ApiOperation({
    summary: 'Finalizar prontuário',
    description:
      'Marcar prontuário como finalizado. Nenhuma atualização adicional permitida depois disso.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do prontuário médico',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Prontuário finalizado',
    type: MedicalRecordResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Prontuário já está finalizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Apenas o criador pode finalizar',
  })
  @ApiResponse({
    status: 404,
    description: 'Prontuário não encontrado',
  })
  async finalize(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string },
  ): Promise<MedicalRecordResponseDto> {
    return this.medicalRecordsService.finalizeMedicalRecord(id, user.sub);
  }

  @Post(':id/appendix')
  @Roles(Role.DOCTOR)
  @ApiOperation({
    summary: 'Adicionar apêndice ao prontuário',
    description:
      'Adicionar correção/informações adicionais a um prontuário finalizado via apêndice.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do prontuário médico',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 201,
    description: 'Apêndice adicionado',
    type: MedicalRecordAppendixResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'O apêndice só pode ser adicionado a prontuários finalizados',
  })
  @ApiResponse({
    status: 404,
    description: 'Prontuário não encontrado',
  })
  async addAppendix(
    @Param('id') id: string,
    @Body() dto: CreateMedicalRecordAppendixDto,
    @CurrentUser() user: { sub: string },
  ): Promise<MedicalRecordAppendixResponseDto> {
    return this.medicalRecordsService.addAppendix(id, dto, user.sub);
  }

  @Get(':id/appendices')
  @Roles(Role.DOCTOR, Role.NURSE)
  @ApiOperation({
    summary: 'Obter apêndices do prontuário',
    description: 'Recuperar todos os apêndices (correções) de um prontuário.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do prontuário médico',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Apêndices recuperados',
    type: [MedicalRecordAppendixResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Prontuário não encontrado',
  })
  async getAppendices(@Param('id') id: string): Promise<MedicalRecordAppendixResponseDto[]> {
    return this.medicalRecordsService.getMedicalRecordAppendices(id);
  }
}
