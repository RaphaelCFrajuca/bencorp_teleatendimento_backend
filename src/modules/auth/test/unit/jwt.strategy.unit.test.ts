import { UnauthorizedException } from '@nestjs/common';
import { Role } from 'src/modules/users/enum/role.enum';
import { JwtStrategy } from '../../strategy/jwt.strategy';

describe('JwtStrategy', () => {
  const logger = {
    warn: jest.fn(),
  };

  const userRepository = {
    getUserById: jest.fn(),
  };

  let strategy: JwtStrategy;

  beforeEach(() => {
    jest.clearAllMocks();
    strategy = new JwtStrategy('secret', userRepository as any, logger as any);
  });

  it('deve lançar UnauthorizedException quando usuário não for encontrado', async () => {
    userRepository.getUserById.mockResolvedValue(null);

    await expect(strategy.validate({ sub: 'u1', email: 'x@y.com' })).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('deve lançar UnauthorizedException quando usuário estiver inativo', async () => {
    userRepository.getUserById.mockResolvedValue({
      id: 'u1',
      name: 'Inativo',
      email: 'x@y.com',
      role: Role.DOCTOR,
      active: false,
    });

    await expect(strategy.validate({ sub: 'u1', email: 'x@y.com' })).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('deve retornar usuário sem password quando payload for válido', async () => {
    userRepository.getUserById.mockResolvedValue({
      id: 'u1',
      name: 'Ativo',
      email: 'x@y.com',
      password: 'hash',
      role: Role.DOCTOR,
      active: true,
    });

    const result = await strategy.validate({ sub: 'u1', email: 'x@y.com' });

    expect(result).toEqual({
      id: 'u1',
      name: 'Ativo',
      email: 'x@y.com',
      role: Role.DOCTOR,
      active: true,
    });
  });
});
