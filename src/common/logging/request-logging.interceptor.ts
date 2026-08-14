import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { Observable, tap } from 'rxjs';
import { TraceContext } from './trace-context';
import { RequestWithTraceId } from './trace-id.middleware';

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(RequestLoggingInterceptor.name);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<RequestWithTraceId>();
    const start = Date.now();

    const traceId = request.traceId ?? TraceContext.getTraceId();

    this.logger.info({
      event: 'request_started',
      method: request.method,
      path: request.url,
      traceId,
    });

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();

        this.logger.info({
          event: 'request_completed',
          method: request.method,
          path: request.url,
          statusCode: response.statusCode,
          latencyMs: Date.now() - start,
          traceId,
        });
      }),
    );
  }
}
