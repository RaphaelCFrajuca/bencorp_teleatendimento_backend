import { Test } from '@nestjs/testing';
import { UsersController } from '../../controller/users.controller';
import { UsersService } from '../../service/users.service';
import { Role } from '../../enum/role.enum';

describe('UsersController Integration', () => {
  const usersService = {
    createUser: jest.fn(),
    getAllUsers: jest.fn(),
    getDoctorUsers: jest.fn(),
    getNurseUsers: jest.fn(),
    getUserByEmail: jest.fn(),
    getUserByName: jest.fn(),
    getUserById: jest.fn(),
    getRoleByUserId: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve delegar criação para service', async () => {
    usersService.createUser.mockResolvedValue({ id: 'u1' });

    const moduleRef = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
    }).compile();

    const controller = moduleRef.get(UsersController);
    const result = await controller.create({
      email: 'admin@bencorp.com',
      name: 'Admin',
      password: '12345678',
      role: Role.ADMIN,
    });

    expect(result.id).toBe('u1');
    expect(usersService.createUser).toHaveBeenCalled();
  });

  it('deve converter skip/limit string em number na listagem de users não se aplica e manter retorno', async () => {
    usersService.getAllUsers.mockResolvedValue([{ id: 'u1' }]);

    const moduleRef = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
    }).compile();

    const controller = moduleRef.get(UsersController);
    const result = await controller.getAllUsers();

    expect(result).toHaveLength(1);
  });
});
