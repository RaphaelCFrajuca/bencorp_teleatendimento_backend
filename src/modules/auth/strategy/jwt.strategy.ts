import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Logger } from 'nestjs-pino';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { UserRepositoryInterface } from 'src/infra/database/interfaces/user.repository.interface';
import { User } from 'src/modules/users/entity/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly jwtSecret: string;

  constructor(
    @Inject('JWT_SECRET') jwtSecret: string,
    private readonly userRepository: UserRepositoryInterface,
    private readonly logger: Logger,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });

    this.jwtSecret = jwtSecret;
  }

  async validate(payload: { sub: string; email: string }): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.getUserById(payload.sub);
    if (!user || !user.active) {
      this.logger.warn('Usuário não encontrado ou inativo.');
      throw new UnauthorizedException('Usuário não encontrado ou inativo.');
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
    };
  }
}
