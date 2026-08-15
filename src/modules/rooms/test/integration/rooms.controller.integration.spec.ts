import { Test } from '@nestjs/testing';
import { RoomTokenGuard } from 'src/common/guards/room-token.guard';
import { Logger } from 'nestjs-pino';
import { RoomsController } from '../../controller/rooms.controller';
import { RoomsService } from '../../service/rooms.service';

describe('RoomsController Integration', () => {
  const roomsService = {
    generateProfessionalToken: jest.fn(),
  };

  it('deve delegar geração de token profissional', async () => {
    roomsService.generateProfessionalToken.mockResolvedValue({ token: 'abc' });

    const moduleRef = await Test.createTestingModule({
      controllers: [RoomsController],
      providers: [
        { provide: RoomsService, useValue: roomsService },
        { provide: 'ROOM_REPOSITORY', useValue: { getActivePatientLinkByHash: jest.fn() } },
        { provide: Logger, useValue: { warn: jest.fn(), log: jest.fn() } },
        { provide: RoomTokenGuard, useValue: { canActivate: jest.fn().mockReturnValue(true) } },
      ],
    }).compile();

    const controller = moduleRef.get(RoomsController);
    const result = await controller.generateProfessionalToken('c1', {
      id: 'u1',
      email: 'doctor@bencorp.com',
      name: 'Doctor',
      role: 'doctor' as any,
      active: true,
    });

    expect(result.token).toBe('abc');
    expect(roomsService.generateProfessionalToken).toHaveBeenCalledWith('c1', expect.any(Object));
  });
});
