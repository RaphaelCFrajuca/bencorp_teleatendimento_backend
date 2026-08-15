import { Test } from '@nestjs/testing';
import { PatientsController } from '../../controller/patients.controller';
import { PatientsService } from '../../service/patients.service';
import { ConsultationsService } from 'src/modules/consultations/service/consultations.service';
import { MedicalRecordsService } from 'src/modules/medical-records/service/medical-records.service';

describe('PatientsController Integration', () => {
  const patientsService = {
    createPatient: jest.fn(),
    listPatients: jest.fn(),
    getPatientById: jest.fn(),
    updatePatient: jest.fn(),
    deactivatePatient: jest.fn(),
  };

  const consultationsService = {
    getConsultationsByPatient: jest.fn(),
  };

  const medicalRecordsService = {
    getMedicalRecordsByPatient: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve converter skip e limit para number', async () => {
    patientsService.listPatients.mockResolvedValue([{ id: 'p1' }]);

    const moduleRef = await Test.createTestingModule({
      controllers: [PatientsController],
      providers: [
        { provide: PatientsService, useValue: patientsService },
        { provide: ConsultationsService, useValue: consultationsService },
        { provide: MedicalRecordsService, useValue: medicalRecordsService },
      ],
    }).compile();

    const controller = moduleRef.get(PatientsController);
    const result = await controller.listPatients('2', '3');

    expect(patientsService.listPatients).toHaveBeenCalledWith(2, 3);
    expect(result).toHaveLength(1);
  });
});
