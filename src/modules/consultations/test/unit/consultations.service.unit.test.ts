import { NotFoundException } from '@nestjs/common';
import { ConsultationsService } from '../../service/consultations.service';
import { ConsultationStatus } from '../../enum/consultation-status.enum';

describe('ConsultationsService', () => {
  const logger = {
    log: jest.fn(),
    warn: jest.fn(),
  };

  const consultationRepository = {
    createConsultation: jest.fn(),
    getConsultationById: jest.fn(),
    listPendingQueue: jest.fn(),
    getConsultationsByProfessional: jest.fn(),
    getConsultationsByPatient: jest.fn(),
    startConsultation: jest.fn(),
    transferToDoctor: jest.fn(),
    finalizeConsultation: jest.fn(),
    cancelConsultation: jest.fn(),
  };

  const consultation = {
    id: 'c1',
    patientId: 'p1',
    professionalId: 'u1',
    status: ConsultationStatus.AGUARDANDO,
    transferredToId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    finalisedAt: null,
  };

  let service: ConsultationsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ConsultationsService(consultationRepository as any, logger as any);
  });

  it('deve criar atendimento aguardando', async () => {
    consultationRepository.createConsultation.mockResolvedValue(consultation);

    const result = await service.createConsultation({ patientId: 'p1' }, 'u1');

    expect(consultationRepository.createConsultation).toHaveBeenCalledWith(
      expect.objectContaining({ status: ConsultationStatus.AGUARDANDO }),
    );
    expect(result.id).toBe('c1');
  });

  it('deve lançar not found ao buscar atendimento inexistente', async () => {
    consultationRepository.getConsultationById.mockResolvedValue(null);

    await expect(service.getConsultationById('x')).rejects.toThrow(NotFoundException);
  });

  it('deve iniciar atendimento e recarregar entidade', async () => {
    consultationRepository.startConsultation.mockResolvedValue(undefined);
    consultationRepository.getConsultationById.mockResolvedValue({
      ...consultation,
      status: ConsultationStatus.EM_ANDAMENTO,
    });

    const result = await service.startConsultation('c1', 'u1');

    expect(consultationRepository.startConsultation).toHaveBeenCalledWith('c1', 'u1');
    expect(result.status).toBe(ConsultationStatus.EM_ANDAMENTO);
  });

  it('deve lançar not found se atendimento desaparecer após start', async () => {
    consultationRepository.startConsultation.mockResolvedValue(undefined);
    consultationRepository.getConsultationById.mockResolvedValue(null);

    await expect(service.startConsultation('x', 'u1')).rejects.toThrow(NotFoundException);
  });

  it('deve lançar not found ao transferir atendimento inexistente', async () => {
    consultationRepository.transferToDoctor.mockResolvedValue(null);

    await expect(service.transferToDoctor('x', { doctorId: 'd1' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('deve lançar not found ao finalizar atendimento inexistente', async () => {
    consultationRepository.finalizeConsultation.mockResolvedValue(null);

    await expect(service.finalizeConsultation('x')).rejects.toThrow(NotFoundException);
  });

  it('deve lançar not found ao cancelar atendimento inexistente', async () => {
    consultationRepository.cancelConsultation.mockResolvedValue(null);

    await expect(service.cancelConsultation('x')).rejects.toThrow(NotFoundException);
  });
});
