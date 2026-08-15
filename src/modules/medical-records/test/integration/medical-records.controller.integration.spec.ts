import { Test } from '@nestjs/testing';
import { MedicalRecordsController } from '../../controller/medical-records.controller';
import { MedicalRecordsService } from '../../service/medical-records.service';

describe('MedicalRecordsController Integration', () => {
  const medicalRecordsService = {
    getMedicalRecordById: jest.fn(),
  };

  it('deve delegar busca por id com id do current user', async () => {
    medicalRecordsService.getMedicalRecordById.mockResolvedValue({ id: 'm1' });

    const moduleRef = await Test.createTestingModule({
      controllers: [MedicalRecordsController],
      providers: [{ provide: MedicalRecordsService, useValue: medicalRecordsService }],
    }).compile();

    const controller = moduleRef.get(MedicalRecordsController);
    const result = await controller.getById('m1', { id: 'u1' });

    expect(medicalRecordsService.getMedicalRecordById).toHaveBeenCalledWith('m1', 'u1');
    expect(result.id).toBe('m1');
  });
});
