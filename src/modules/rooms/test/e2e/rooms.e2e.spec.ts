import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Logger } from 'nestjs-pino';
import { RoomTokenGuard } from 'src/common/guards/room-token.guard';
import request from 'supertest';
import { RoomsController } from '../../controller/rooms.controller';
import { RoomsService } from '../../service/rooms.service';

describe('Rooms e2e', () => {
  let app: INestApplication;

  const roomsService = {
    generatePatientToken: jest.fn(),
  };

  const roomRepository = {
    getActivePatientLinkByHash: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [RoomsController],
      providers: [
        { provide: RoomsService, useValue: roomsService },
        { provide: 'ROOM_REPOSITORY', useValue: roomRepository },
        { provide: Logger, useValue: { warn: jest.fn(), log: jest.fn() } },
        { provide: RoomTokenGuard, useValue: { canActivate: jest.fn().mockReturnValue(true) } },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /rooms/patient-links/:token/token deve retornar 201 sem HttpCode', async () => {
    roomRepository.getActivePatientLinkByHash.mockResolvedValue({ id: 'l1', consultationId: 'c1' });
    roomsService.generatePatientToken.mockResolvedValue({ token: 'patient-token' });

    const response = await request(app.getHttpServer()).post('/rooms/patient-links/opaque/token');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ token: 'patient-token' });
  });
});
