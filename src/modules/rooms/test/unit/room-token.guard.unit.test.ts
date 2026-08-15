import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RoomTokenGuard } from 'src/common/guards/room-token.guard';

describe('RoomTokenGuard', () => {
  const roomRepository = {
    getActivePatientLinkByHash: jest.fn(),
  };

  const logger = {
    warn: jest.fn(),
  };

  const createContext = (token?: unknown): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          params: { token },
          url: '/rooms/patient-links/x/token',
        }),
      }),
    }) as any;

  let guard: RoomTokenGuard;

  beforeEach(() => {
    jest.clearAllMocks();
    guard = new RoomTokenGuard(roomRepository as any, logger as any);
  });

  it('deve lançar forbidden se token não existir', async () => {
    await expect(guard.canActivate(createContext(undefined))).rejects.toThrow(ForbiddenException);
  });

  it('deve lançar forbidden se token for inválido', async () => {
    roomRepository.getActivePatientLinkByHash.mockResolvedValue(null);

    await expect(guard.canActivate(createContext('opaque'))).rejects.toThrow(ForbiddenException);
  });

  it('deve permitir e anexar patientLink no request', async () => {
    const link = { id: 'l1', consultationId: 'c1' };
    roomRepository.getActivePatientLinkByHash.mockResolvedValue(link);

    const request: any = {
      params: { token: 'opaque' },
      url: '/rooms/patient-links/opaque/token',
    };

    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.patientLink).toEqual(link);
  });
});
