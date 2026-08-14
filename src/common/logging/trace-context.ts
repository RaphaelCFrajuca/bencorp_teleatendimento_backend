import { AsyncLocalStorage } from 'async_hooks';

export const TRACE_ID_HEADER = 'x-trace-id';

type TraceContextStore = {
  traceId: string;
};

const traceContextStorage = new AsyncLocalStorage<TraceContextStore>();

export class TraceContext {
  static run<T>(traceId: string, callback: () => T): T {
    return traceContextStorage.run({ traceId }, callback);
  }

  static getTraceId(): string | undefined {
    return traceContextStorage.getStore()?.traceId;
  }
}
