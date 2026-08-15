import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

const mockCanActivate = jest.fn();

jest.mock('@nestjs/passport', () => ({
  AuthGuard: () => {
    return class {
      canActivate(context: ExecutionContext) {
        return mockCanActivate(context);
      }
    };
  },
}));

describe('JwtAuthGuard', () => {
  const reflector = {
    getAllAndOverride: jest.fn(),
  } as unknown as Reflector;

  const createContext = (): ExecutionContext =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
    }) as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve permitir rota pública sem chamar AuthGuard base', () => {
    reflector.getAllAndOverride = jest.fn().mockReturnValue(true);
    const guard = new JwtAuthGuard(reflector);

    expect(guard.canActivate(createContext())).toBe(true);
    expect(mockCanActivate).not.toHaveBeenCalled();
  });

  it('deve delegar para AuthGuard base em rota protegida', () => {
    reflector.getAllAndOverride = jest.fn().mockReturnValue(false);
    mockCanActivate.mockReturnValue(true);
    const guard = new JwtAuthGuard(reflector);

    expect(guard.canActivate(createContext())).toBe(true);
    expect(mockCanActivate).toHaveBeenCalled();
  });
});
