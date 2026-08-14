import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/infra/database/database.module';
import { ConsultationsModule } from '../consultations/consultations.module';
import { MedicalRecordsModule } from '../medical-records/medical-records.module';
import { PatientsController } from './controller/patients.controller';
import { PatientsService } from './service/patients.service';

@Module({
  imports: [DatabaseModule, ConsultationsModule, MedicalRecordsModule],
  controllers: [PatientsController],
  providers: [PatientsService],
  exports: [PatientsService],
})
export class PatientsModule {}
