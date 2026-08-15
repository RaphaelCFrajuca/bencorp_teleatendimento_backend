import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../../guards/roles.guard';
import { Role } from 'src/modules/users/enum/role.enum';

describe('RolesGuard', () => {
  const reflector = {
    getAllAndOverride: jest.fn(),
  } as unknown as Reflector;

  const logger = {
    log: jest.fn(),
    warn: jest.fn(),
  };

  const createContext = (user?: any): ExecutionContext =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    }) as any;

  let guard: RolesGuard;

  beforeEach(() => {
    jest.clearAllMocks();
    guard = new RolesGuard(reflector, logger as any);
  });

  it('deve permitir quando rota não exigir role', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined);

    expect(guard.canActivate(createContext())).toBe(true);
  });

  it('deve lançar unauthorized sem user no request', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([Role.ADMIN]);

    expect(() => guard.canActivate(createContext())).toThrow(UnauthorizedException);
  });

  it('deve lançar forbidden para role não permitida', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([Role.ADMIN]);

    expect(() => guard.canActivate(createContext({ id: 'u1', role: Role.NURSE }))).toThrow(
      ForbiddenException,
    );
  });

  it('deve permitir role autorizada', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([Role.NURSE]);

    expect(guard.canActivate(createContext({ id: 'u1', role: Role.NURSE }))).toBe(true);
  });
});
