import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { loggerModuleOptions } from './common/logging/logger-options';
import { RequestLoggingInterceptor } from './common/logging/request-logging.interceptor';
import { TraceIdMiddleware } from './common/logging/trace-id.middleware';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [LoggerModule.forRoot(loggerModuleOptions), UsersModule],
  controllers: [],
  providers: [{ provide: APP_INTERCEPTOR, useClass: RequestLoggingInterceptor }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TraceIdMiddleware).forRoutes('*');
  }
}
