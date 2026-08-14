import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { DatabaseModule } from 'src/infra/database/database.module';
import { MedicalRecordAuditInterceptor } from './interceptor/medical-record-audit.interceptor';
import { AuditLogsService } from './service/audit-logs.service';

@Module({
  imports: [LoggerModule.forRoot(), DatabaseModule],
  providers: [AuditLogsService, MedicalRecordAuditInterceptor],
  exports: [AuditLogsService, MedicalRecordAuditInterceptor],
})
export class AuditLogsModule {}
