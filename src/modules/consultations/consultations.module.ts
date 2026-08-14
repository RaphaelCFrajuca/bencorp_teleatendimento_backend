import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/infra/database/database.module';
import { ConsultationsController } from './controller/consultations.controller';
import { ConsultationsService } from './service/consultations.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ConsultationsController],
  providers: [ConsultationsService],
  exports: [ConsultationsService],
})
export class ConsultationsModule {}
