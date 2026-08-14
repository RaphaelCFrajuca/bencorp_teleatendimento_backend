import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Logger } from 'nestjs-pino';
import type { UserRepositoryInterface } from 'src/infra/database/interfaces/user.repository.interface';
import { LoginResponseDto } from '../dto/login-response.dto';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject('USER_REPOSITORY') private readonly userRepository: UserRepositoryInterface,
    private readonly logger: Logger,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    this.logger.log('Tentativa de login', { email: dto.email });
    const user = await this.userRepository.getUserByEmail(dto.email);

    if (!user || !user.active) {
      this.logger.warn(
        `Falha de login para o usuário ${dto.email}: usuário não encontrado ou inativo`,
      );
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const validPassword = await bcrypt.compare(dto.password, user.password);
    if (!validPassword) {
      this.logger.warn(`Falha de login para o usuário ${user.id}: senha inválida`);
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = { sub: user.id };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}
