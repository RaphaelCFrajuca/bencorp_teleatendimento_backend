import { Test } from '@nestjs/testing';
import { AuthController } from '../../controller/auth.controller';
import { AuthService } from '../../service/auth.service';

describe('AuthController Integration', () => {
  const authService = {
    login: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve delegar login para o service', async () => {
    authService.login.mockResolvedValue({
      accessToken: 'jwt-token',
      user: { id: 'u1', email: 'doctor@bencorp.com', role: 'doctor' },
    });

    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    const controller = moduleRef.get(AuthController);
    const result = await controller.login({
      email: 'doctor@bencorp.com',
      password: '12345678',
    });

    expect(result.accessToken).toBe('jwt-token');
    expect(authService.login).toHaveBeenCalled();
  });
});
