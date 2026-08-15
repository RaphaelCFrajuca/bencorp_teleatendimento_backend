import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Logger } from 'nestjs-pino';
import type { UserRepositoryInterface } from 'src/infra/database/interfaces/user.repository.interface';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { Role } from '../enum/role.enum';

const SALT_ROUNDS = 12;

@Injectable()
export class UsersService {
  constructor(
    @Inject('USER_REPOSITORY') private readonly userRepository: UserRepositoryInterface,
    private readonly logger: Logger,
  ) {}

  private mapUserToResponse(user: {
    id: string;
    email: string;
    name: string;
    role: Role;
    active: boolean;
  }): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      active: user.active,
    };
  }

  async createUser(dto: CreateUserDto): Promise<UserResponseDto> {
    this.logger.log('Tentativa de criação de usuário', { email: dto.email, role: dto.role });

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = await this.userRepository.createUser({
      email: dto.email,
      name: dto.name,
      password: passwordHash,
      role: dto.role,
    });

    this.logger.log(`Usuário criado com sucesso: ${user.id}`);
    return this.mapUserToResponse(user);
  }

  async getAllUsers(): Promise<UserResponseDto[]> {
    this.logger.log('Listando todos os usuários');
    const users = await this.userRepository.getAllUsers();
    return users.map((user) => this.mapUserToResponse(user));
  }

  async getDoctorUsers(): Promise<UserResponseDto[]> {
    this.logger.log('Listando usuários com role de médico');
    const users = await this.userRepository.getUsersByRole(Role.DOCTOR);
    return users.map((user) => this.mapUserToResponse(user));
  }

  async getNurseUsers(): Promise<UserResponseDto[]> {
    this.logger.log('Listando usuários com role de enfermeiro');
    const users = await this.userRepository.getUsersByRole(Role.NURSE);
    return users.map((user) => this.mapUserToResponse(user));
  }

  async getUserById(id: string): Promise<UserResponseDto> {
    this.logger.log(`Buscando usuário por ID: ${id}`);
    const user = await this.userRepository.getUserById(id);

    if (!user) {
      this.logger.warn(`Usuário não encontrado para o ID: ${id}`);
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }

    return this.mapUserToResponse(user);
  }

  async getUserByEmail(email: string): Promise<UserResponseDto | null> {
    this.logger.log(`Buscando usuário por email: ${email}`);
    const user = await this.userRepository.getUserByEmail(email);
    return user ? this.mapUserToResponse(user) : null;
  }

  async getUserByName(name: string): Promise<UserResponseDto | null> {
    this.logger.log(`Buscando usuário por nome: ${name}`);
    const user = await this.userRepository.getUserByName(name);
    return user ? this.mapUserToResponse(user) : null;
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    this.logger.log(`Tentativa de atualização do usuário ID: ${id}`);

    const payload: Partial<{
      email: string;
      name: string;
      password: string;
      role: Role;
      active: boolean;
    }> = {
      ...dto,
    };

    if (dto.password) {
      payload.password = await bcrypt.hash(dto.password, SALT_ROUNDS);
    }

    const user = await this.userRepository.updateUser(id, payload);
    if (!user) {
      this.logger.warn(`Usuário não encontrado para atualização: ${id}`);
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }

    this.logger.log(`Usuário atualizado com sucesso: ${id}`);
    return this.mapUserToResponse(user);
  }

  async deleteUser(id: string): Promise<boolean> {
    this.logger.log(`Tentativa de exclusão do usuário ID: ${id}`);
    const deleted = await this.userRepository.deleteUser(id);

    if (!deleted) {
      this.logger.warn(`Não foi possível excluir usuário ID: ${id}`);
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }

    this.logger.log(`Usuário excluído com sucesso: ${id}`);
    return deleted;
  }

  async getRoleByUserId(id: string): Promise<Role> {
    this.logger.log(`Buscando role do usuário ID: ${id}`);
    return this.userRepository.getRoleByUserId(id);
  }
}
