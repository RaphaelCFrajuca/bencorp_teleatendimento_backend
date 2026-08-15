import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { ConsultationsController } from '../../controller/consultations.controller';
import { ConsultationsService } from '../../service/consultations.service';

describe('Consultations e2e', () => {
  let app: INestApplication;

  const consultationsService = {
    listPendingQueue: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ConsultationsController],
      providers: [{ provide: ConsultationsService, useValue: consultationsService }],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /consultations/queue deve retornar 200', async () => {
    consultationsService.listPendingQueue.mockResolvedValue([{ id: 'c1' }]);

    const response = await request(app.getHttpServer()).get('/consultations/queue');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ id: 'c1' }]);
  });
});
