import type { Params } from 'nestjs-pino';
import { TraceContext } from './trace-context';

export const loggerModuleOptions: Params = {
  pinoHttp: {
    customProps: () => {
      const traceId = TraceContext.getTraceId();

      return traceId ? { traceId } : {};
    },
  },
};
