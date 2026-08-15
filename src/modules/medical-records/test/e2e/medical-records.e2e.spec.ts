import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { MedicalRecordsController } from '../../controller/medical-records.controller';
import { MedicalRecordsService } from '../../service/medical-records.service';

describe('MedicalRecords e2e', () => {
  let app: INestApplication;

  const medicalRecordsService = {
    getMedicalRecordAppendices: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [MedicalRecordsController],
      providers: [{ provide: MedicalRecordsService, useValue: medicalRecordsService }],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /medical-records/:id/appendices deve retornar 200', async () => {
    medicalRecordsService.getMedicalRecordAppendices.mockResolvedValue([{ id: 'a1' }]);

    const response = await request(app.getHttpServer()).get('/medical-records/m1/appendices');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ id: 'a1' }]);
  });
});
