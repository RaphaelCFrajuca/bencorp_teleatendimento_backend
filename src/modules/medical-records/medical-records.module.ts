import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infra/database/database.module';
import { MedicalRecordsController } from './controller/medical-records.controller';
import { MedicalRecordsService } from './service/medical-records.service';

@Module({
  imports: [DatabaseModule],
  providers: [MedicalRecordsService],
  controllers: [MedicalRecordsController],
  exports: [MedicalRecordsService],
})
export class MedicalRecordsModule {}
