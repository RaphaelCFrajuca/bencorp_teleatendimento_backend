import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/modules/users/enum/role.enum';
import { AuthService } from '../../service/auth.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  const logger = {
    log: jest.fn(),
    warn: jest.fn(),
  };

  const userRepository = {
    getUserByEmail: jest.fn(),
  };

  const jwtService = {
    signAsync: jest.fn(),
  } as unknown as JwtService;

  const dto = {
    email: 'doctor@bencorp.com',
    password: '12345678',
  };

  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(userRepository as any, logger as any, jwtService);
  });

  it('deve lançar UnauthorizedException quando usuário não existir', async () => {
    userRepository.getUserByEmail.mockResolvedValue(null);

    await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
  });

  it('deve lançar UnauthorizedException quando usuário estiver inativo', async () => {
    userRepository.getUserByEmail.mockResolvedValue({
      id: 'u1',
      email: dto.email,
      password: 'hash',
      role: Role.DOCTOR,
      active: false,
    });

    await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
  });

  it('deve lançar UnauthorizedException quando senha estiver inválida', async () => {
    userRepository.getUserByEmail.mockResolvedValue({
      id: 'u1',
      email: dto.email,
      password: 'hash',
      role: Role.DOCTOR,
      active: true,
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
  });

  it('deve retornar token e dados do usuário quando credenciais forem válidas', async () => {
    userRepository.getUserByEmail.mockResolvedValue({
      id: 'u1',
      email: dto.email,
      password: 'hash',
      role: Role.DOCTOR,
      active: true,
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwtService.signAsync as jest.Mock).mockResolvedValue('jwt-token');

    const result = await service.login(dto);

    expect(result).toEqual({
      accessToken: 'jwt-token',
      user: {
        id: 'u1',
        email: dto.email,
        role: Role.DOCTOR,
      },
    });
    expect(jwtService.signAsync).toHaveBeenCalledWith({ sub: 'u1' });
  });
});
