import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/infra/database/database.module';
import { PatientsController } from './controller/patients.controller';
import { PatientsService } from './service/patients.service';

@Module({
  imports: [DatabaseModule],
  controllers: [PatientsController],
  providers: [PatientsService],
  exports: [PatientsService],
})
export class PatientsModule {}
