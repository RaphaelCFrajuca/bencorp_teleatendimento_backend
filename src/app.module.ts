import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { loggerModuleOptions } from './common/logging/logger-options';
import { RequestLoggingInterceptor } from './common/logging/request-logging.interceptor';
import { TraceIdMiddleware } from './common/logging/trace-id.middleware';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { MedicalRecordAuditInterceptor } from './modules/audit-logs/interceptor/medical-record-audit.interceptor';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';
import { ConsultationsModule } from './modules/consultations/consultations.module';
import { MedicalRecordsModule } from './modules/medical-records/medical-records.module';
import { PatientsModule } from './modules/patients/patients.module';
import { RoomsModule } from './modules/rooms.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    LoggerModule.forRoot(loggerModuleOptions),
    UsersModule,
    AuthModule,
    PatientsModule,
    ConsultationsModule,
    RoomsModule,
    MedicalRecordsModule,
    AuditLogsModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: RequestLoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: MedicalRecordAuditInterceptor },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TraceIdMiddleware).forRoutes('*');
  }
}
