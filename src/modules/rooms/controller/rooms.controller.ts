import { Controller, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoomTokenGuard } from 'src/common/guards/room-token.guard';
import { UserResponseDto } from 'src/modules/users/dto/user-response.dto';
import { Role } from 'src/modules/users/enum/role.enum';
import { PatientLinkResponseDto } from '../dto/patient-link-response.dto';
import { RoomTokenResponseDto } from '../dto/room-token-response.dto';
import { RoomsService } from '../service/rooms.service';

@Controller('rooms')
@ApiTags('Rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post('consultations/:consultationId/professional-token')
  @Roles(Role.NURSE, Role.DOCTOR)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Emite token LiveKit para profissional do atendimento',
  })
  @ApiOkResponse({
    description: 'Token emitido com sucesso.',
    type: RoomTokenResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Não autorizado.' })
  @ApiForbiddenResponse({ description: 'Acesso à sala não permitido.' })
  @ApiNotFoundResponse({ description: 'Atendimento não encontrado.' })
  @ApiConflictResponse({ description: 'Atendimento indisponível para acesso à sala.' })
  @ApiParam({ name: 'consultationId', type: String, format: 'uuid' })
  async generateProfessionalToken(
    @Param('consultationId') consultationId: string,
    @CurrentUser() user: UserResponseDto,
  ): Promise<RoomTokenResponseDto> {
    return this.roomsService.generateProfessionalToken(consultationId, user);
  }

  @Post('consultations/:consultationId/patient-link')
  @Roles(Role.NURSE, Role.DOCTOR)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Gera link opaco de uso único para paciente',
  })
  @ApiOkResponse({
    description: 'Link gerado com sucesso.',
    type: PatientLinkResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Não autorizado.' })
  @ApiForbiddenResponse({ description: 'Acesso à sala não permitido.' })
  @ApiNotFoundResponse({ description: 'Atendimento não encontrado.' })
  @ApiConflictResponse({ description: 'Atendimento indisponível para acesso à sala.' })
  @ApiParam({ name: 'consultationId', type: String, format: 'uuid' })
  async createPatientLink(
    @Param('consultationId') consultationId: string,
    @CurrentUser() user: UserResponseDto,
  ): Promise<PatientLinkResponseDto> {
    return this.roomsService.createPatientLink(consultationId, user);
  }

  @Post('patient-links/:token/token')
  @Public()
  @UseGuards(RoomTokenGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Emite token LiveKit para paciente via link opaco',
  })
  @ApiOkResponse({
    description: 'Token emitido com sucesso.',
    type: RoomTokenResponseDto,
  })
  @ApiForbiddenResponse({ description: 'Acesso à sala não permitido.' })
  @ApiParam({ name: 'token', type: String })
  async generatePatientToken(@Param('token') token: string): Promise<RoomTokenResponseDto> {
    return this.roomsService.generatePatientToken(token);
  }
}
