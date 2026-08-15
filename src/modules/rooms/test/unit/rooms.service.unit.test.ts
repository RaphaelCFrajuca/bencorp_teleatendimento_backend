import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { RoomsService } from '../../service/rooms.service';
import { ConsultationStatus } from 'src/modules/consultations/enum/consultation-status.enum';
import { Role } from 'src/modules/users/enum/role.enum';

describe('RoomsService', () => {
  const roomRepository = {
    getConsultationForRoom: jest.fn(),
    createPatientLink: jest.fn(),
    getActivePatientLinkByHash: jest.fn(),
    consumePatientLinkByHash: jest.fn(),
  };

  const livekitAdapter = {
    generateRoomToken: jest.fn(),
  };

  const logger = {
    warn: jest.fn(),
    log: jest.fn(),
  };

  const user = {
    id: 'u1',
    email: 'doctor@bencorp.com',
    name: 'Doctor',
    role: Role.DOCTOR,
    active: true,
  };

  let service: RoomsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RoomsService(roomRepository as any, livekitAdapter as any, logger as any);
  });

  it('deve lançar not found se consulta não existir para token profissional', async () => {
    roomRepository.getConsultationForRoom.mockResolvedValue(null);

    await expect(service.generateProfessionalToken('c1', user)).rejects.toThrow(NotFoundException);
  });

  it('deve lançar conflict se consulta não estiver em andamento', async () => {
    roomRepository.getConsultationForRoom.mockResolvedValue({
      id: 'c1',
      status: ConsultationStatus.AGUARDANDO,
    });

    await expect(service.generateProfessionalToken('c1', user)).rejects.toThrow(ConflictException);
  });

  it('deve lançar forbidden para profissional não atribuído', async () => {
    roomRepository.getConsultationForRoom.mockResolvedValue({
      id: 'c1',
      status: ConsultationStatus.EM_ANDAMENTO,
      professionalId: 'u2',
      transferredToId: null,
      roomVersion: 1,
    });

    await expect(service.generateProfessionalToken('c1', user)).rejects.toThrow(ForbiddenException);
  });

  it('deve gerar token profissional quando válido', async () => {
    roomRepository.getConsultationForRoom
      .mockResolvedValueOnce({
        id: 'c1',
        status: ConsultationStatus.EM_ANDAMENTO,
        professionalId: 'u1',
        transferredToId: null,
        roomVersion: 1,
      })
      .mockResolvedValueOnce({
        id: 'c1',
        status: ConsultationStatus.EM_ANDAMENTO,
        professionalId: 'u1',
        transferredToId: null,
        roomVersion: 1,
      });
    livekitAdapter.generateRoomToken.mockResolvedValue({ token: 'livekit' });

    const result = await service.generateProfessionalToken('c1', user);

    expect(result).toEqual({ token: 'livekit' });
  });

  it('deve lançar forbidden ao gerar token de paciente com link inválido', async () => {
    roomRepository.getActivePatientLinkByHash.mockResolvedValue(null);

    await expect(service.generatePatientToken('opaque')).rejects.toThrow(ForbiddenException);
  });
});
