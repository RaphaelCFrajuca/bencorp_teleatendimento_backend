import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Logger } from 'nestjs-pino';
import type { UserRepositoryInterface } from 'src/infra/database/interfaces/user.repository.interface';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';

const SALT_ROUNDS = 12;

@Injectable()
export class UsersService {
  constructor(
    @Inject('USER_REPOSITORY') private readonly userRepository: UserRepositoryInterface,
    private readonly logger: Logger,
  ) {}

  async createUser(dto: CreateUserDto): Promise<UserResponseDto> {
    console.log(dto);
    this.logger.log('Tentativa de criação de usuário', { email: dto.email, role: dto.role });

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = await this.userRepository.createUser({
      email: dto.email,
      name: dto.name,
      password: passwordHash,
      role: dto.role,
    });

    this.logger.log(`Usuário criado com sucesso: ${user.id}`);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      active: user.active,
    };
  }
}
