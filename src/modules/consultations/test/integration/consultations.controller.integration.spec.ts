import { Test } from '@nestjs/testing';
import { ConsultationsController } from '../../controller/consultations.controller';
import { ConsultationsService } from '../../service/consultations.service';

describe('ConsultationsController Integration', () => {
  const consultationsService = {
    listPendingQueue: jest.fn(),
    createConsultation: jest.fn(),
    getConsultationsByProfessional: jest.fn(),
    getConsultationById: jest.fn(),
    startConsultation: jest.fn(),
    transferToDoctor: jest.fn(),
    finalizeConsultation: jest.fn(),
    cancelConsultation: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve converter skip/limit para number em listQueue', async () => {
    consultationsService.listPendingQueue.mockResolvedValue([{ id: 'c1' }]);

    const moduleRef = await Test.createTestingModule({
      controllers: [ConsultationsController],
      providers: [{ provide: ConsultationsService, useValue: consultationsService }],
    }).compile();

    const controller = moduleRef.get(ConsultationsController);
    const result = await controller.listQueue('1', '2');

    expect(consultationsService.listPendingQueue).toHaveBeenCalledWith(1, 2);
    expect(result).toHaveLength(1);
  });
});
