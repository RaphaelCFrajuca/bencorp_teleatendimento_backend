import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { loggerModuleOptions } from './common/logging/logger-options';
import { RequestLoggingInterceptor } from './common/logging/request-logging.interceptor';
import { TraceIdMiddleware } from './common/logging/trace-id.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';
import { PatientsModule } from './modules/patients/patients.module';
import { UsersModule } from './modules/users/users.module';
import { ConsultationsModule } from './modules/consultations/consultations.module';

@Module({
  imports: [LoggerModule.forRoot(loggerModuleOptions), UsersModule, AuthModule, PatientsModule, ConsultationsModule],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: RequestLoggingInterceptor },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TraceIdMiddleware).forRoutes('*');
  }
}
