import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infra/database/database.module';
import { MedicalRecordsService } from './service/medical-records.service';
import { MedicalRecordsController } from './controller/medical-records.controller';

@Module({
  imports: [DatabaseModule],
  providers: [MedicalRecordsService],
  controllers: [MedicalRecordsController],
  exports: [MedicalRecordsService],
})
export class MedicalRecordsModule {}
