import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { ROLES_KEY } from 'src/common/environment/decorators/roles.decorator';
import { Role } from 'src/modules/users/enum/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly logger: Logger,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new UnauthorizedException();
    }

    this.logger.log(`Verificando permissões do usuário: ${user.id}`);
    const permitido = requiredRoles.includes(user.role);
    if (!permitido) {
      this.logger.warn(
        `Usuário ${user.id} com perfil ${user.role} tentou acessar recurso sem permissão.`,
      );
      throw new ForbiddenException('Perfil sem permissão para este recurso');
    }

    return true;
  }
}
