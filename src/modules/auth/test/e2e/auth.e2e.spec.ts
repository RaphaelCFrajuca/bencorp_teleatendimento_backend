import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Role } from 'src/modules/users/enum/role.enum';
import request from 'supertest';
import { AuthController } from '../../controller/auth.controller';
import { AuthService } from '../../service/auth.service';

describe('Auth e2e', () => {
  let app: INestApplication;

  const authService = {
    login: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /auth/login deve retornar 200', async () => {
    authService.login.mockResolvedValue({
      accessToken: 'token',
      user: {
        id: 'u1',
        email: 'doctor@bencorp.com',
        role: Role.DOCTOR,
      },
    });

    const response = await request(app.getHttpServer()).post('/auth/login').send({
      email: 'doctor@bencorp.com',
      password: '12345678',
    });

    expect(response.status).toBe(200);
    expect(response.body.accessToken).toBe('token');
  });

  it('POST /auth/login deve validar payload inválido', async () => {
    const response = await request(app.getHttpServer()).post('/auth/login').send({
      email: 'invalido',
      password: '123',
    });

    expect(response.status).toBe(400);
  });
});
