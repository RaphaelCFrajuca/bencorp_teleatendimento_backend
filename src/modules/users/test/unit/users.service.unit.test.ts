import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../../service/users.service';
import { Role } from '../../enum/role.enum';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

describe('UsersService', () => {
  const logger = {
    log: jest.fn(),
    warn: jest.fn(),
  };

  const userRepository = {
    createUser: jest.fn(),
    getAllUsers: jest.fn(),
    getUsersByRole: jest.fn(),
    getUserById: jest.fn(),
    getUserByEmail: jest.fn(),
    getUserByName: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    getRoleByUserId: jest.fn(),
  };

  let service: UsersService;

  const user = {
    id: 'u1',
    email: 'user@bencorp.com',
    name: 'User',
    role: Role.NURSE,
    active: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UsersService(userRepository as any, logger as any);
  });

  it('deve criar usuário com senha hash', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
    userRepository.createUser.mockResolvedValue(user);

    const result = await service.createUser({
      email: user.email,
      name: user.name,
      password: '12345678',
      role: user.role,
    });

    expect(userRepository.createUser).toHaveBeenCalledWith(
      expect.objectContaining({ password: 'hashed' }),
    );
    expect(result.id).toBe(user.id);
  });

  it('deve listar usuários por role de médico', async () => {
    userRepository.getUsersByRole.mockResolvedValue([user]);

    const result = await service.getDoctorUsers();

    expect(userRepository.getUsersByRole).toHaveBeenCalledWith(Role.DOCTOR);
    expect(result).toHaveLength(1);
  });

  it('deve lançar not found ao buscar por id inexistente', async () => {
    userRepository.getUserById.mockResolvedValue(null);

    await expect(service.getUserById('x')).rejects.toThrow(NotFoundException);
  });

  it('deve atualizar usuário e fazer hash da senha quando enviada', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed2');
    userRepository.updateUser.mockResolvedValue(user);

    const result = await service.updateUser('u1', { password: '12345678' });

    expect(userRepository.updateUser).toHaveBeenCalledWith('u1', { password: 'hashed2' });
    expect(result.id).toBe('u1');
  });

  it('deve lançar not found ao atualizar usuário inexistente', async () => {
    userRepository.updateUser.mockResolvedValue(null);

    await expect(service.updateUser('x', { name: 'Novo' })).rejects.toThrow(NotFoundException);
  });

  it('deve lançar not found ao excluir usuário inexistente', async () => {
    userRepository.deleteUser.mockResolvedValue(false);

    await expect(service.deleteUser('x')).rejects.toThrow(NotFoundException);
  });

  it('deve retornar role do usuário', async () => {
    userRepository.getRoleByUserId.mockResolvedValue(Role.ADMIN);

    const result = await service.getRoleByUserId('u1');

    expect(result).toBe(Role.ADMIN);
  });
});
