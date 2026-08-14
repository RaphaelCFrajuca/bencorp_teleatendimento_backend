import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { Observable, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuditLogsService } from '../service/audit-logs.service';
import { AuditAction } from '../enum/audit-action.enum';

@Injectable()
export class MedicalRecordAuditInterceptor implements NestInterceptor {
  private readonly actionMap: Record<string, AuditAction> = {
    'POST /medical-records': AuditAction.CRIAR,
    'GET /medical-records/:id': AuditAction.BUSCAR,
    'PATCH /medical-records/:id': AuditAction.ATUALIZAR,
    'POST /medical-records/:id/finalize': AuditAction.FINALIZAR,
    'POST /medical-records/:id/appendix': AuditAction.ADICIONAR_APENDICE,
    'GET /medical-records/:id/appendices': AuditAction.LISTAR_APENDICES,
  };

  constructor(
    private readonly auditLogsService: AuditLogsService,
    private readonly logger: Logger,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, user } = request;
    const ipAddress = request.ip || request.connection.remoteAddress;
    const userAgent = request.get('user-agent');

    return next.handle().pipe(
      tap(async () => {
        this.logAuditIfMedicalRecordEndpoint(
          method,
          url,
          response.statusCode,
          user,
          ipAddress,
          userAgent,
        );
      }),
      catchError((error) => {
        this.logAuditIfMedicalRecordEndpoint(
          method,
          url,
          error.status || 500,
          user,
          ipAddress,
          userAgent,
        );
        throw error;
      }),
    );
  }

  private logAuditIfMedicalRecordEndpoint(
    method: string,
    url: string,
    statusCode: number,
    user: any,
    ipAddress: string,
    userAgent: string,
  ): void {
    if (!url.includes('/medical-records')) {
      return;
    }

    if (!user) {
      return;
    }

    const action = this.mapEndpointToAction(method, url);
    if (!action) {
      return;
    }

    const userId = user?.id || user?.sub;
    if (!userId) {
      this.logger.warn({ user }, 'Usuário sem id/sub no contexto para auditoria');
      return;
    }

    const patientId = this.extractPatientIdFromUrl(url);
    const medicalRecordId = this.extractMedicalRecordId(url);

    if (patientId) {
      this.auditLogsService.logMedicalRecordAccess(
        userId,
        user.role,
        patientId,
        action,
        url,
        method,
        statusCode,
        medicalRecordId,
        ipAddress,
        userAgent,
      ).catch((error) => {
        this.logger.error({ error }, 'Erro ao registrar auditoria');
      });
    }
  }

  private mapEndpointToAction(method: string, url: string): AuditAction | null {
    for (const [endpoint, action] of Object.entries(this.actionMap)) {
      const [endpointMethod, endpointPath] = endpoint.split(' ');
      if (method === endpointMethod && this.pathMatches(url, endpointPath)) {
        return action;
      }
    }
    return null;
  }

  private pathMatches(url: string, pattern: string): boolean {
    const urlPath = url.split('?')[0];
    const regexPattern = pattern.replace(/:\w+/g, '[^/]+');
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(urlPath);
  }

  private extractPatientIdFromUrl(url: string): string | null {
    const match = url.match(/medical-records\/([a-f0-9-]+)/);
    return match ? match[1] : null;
  }

  private extractMedicalRecordId(url: string): string | null {
    const match = url.match(/medical-records\/([a-f0-9-]+)(?:\/|$|\?)/);
    return match ? match[1] : null;
  }
}
