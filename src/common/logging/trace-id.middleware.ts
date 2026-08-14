import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { TRACE_ID_HEADER, TraceContext } from './trace-context';

export type RequestWithTraceId = Request & {
  traceId?: string;
};

@Injectable()
export class TraceIdMiddleware implements NestMiddleware {
  use(req: RequestWithTraceId, res: Response, next: NextFunction) {
    const incomingTraceId = req.headers[TRACE_ID_HEADER];

    const traceId =
      typeof incomingTraceId === 'string' && incomingTraceId.trim().length > 0
        ? incomingTraceId.trim()
        : randomUUID();

    req.traceId = traceId;
    req.headers[TRACE_ID_HEADER] = traceId;

    res.setHeader(TRACE_ID_HEADER, traceId);

    return TraceContext.run(traceId, next);
  }
}
