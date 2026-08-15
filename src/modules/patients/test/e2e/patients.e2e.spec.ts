import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ConsultationsService } from 'src/modules/consultations/service/consultations.service';
import { MedicalRecordsService } from 'src/modules/medical-records/service/medical-records.service';
import request from 'supertest';
import { PatientsController } from '../../controller/patients.controller';
import { PatientsService } from '../../service/patients.service';

describe('Patients e2e', () => {
  let app: INestApplication;

  const patientsService = {
    listPatients: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PatientsController],
      providers: [
        { provide: PatientsService, useValue: patientsService },
        { provide: ConsultationsService, useValue: { getConsultationsByPatient: jest.fn() } },
        { provide: MedicalRecordsService, useValue: { getMedicalRecordsByPatient: jest.fn() } },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /patients deve retornar 200', async () => {
    patientsService.listPatients.mockResolvedValue([{ id: 'p1' }]);

    const response = await request(app.getHttpServer()).get('/patients');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ id: 'p1' }]);
  });
});
