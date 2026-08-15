import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { UsersController } from '../../controller/users.controller';
import { UsersService } from '../../service/users.service';

describe('Users e2e', () => {
  let app: INestApplication;

  const usersService = {
    getAllUsers: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /users deve retornar 200', async () => {
    usersService.getAllUsers.mockResolvedValue([{ id: 'u1' }]);

    const response = await request(app.getHttpServer()).get('/users');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ id: 'u1' }]);
  });
});
