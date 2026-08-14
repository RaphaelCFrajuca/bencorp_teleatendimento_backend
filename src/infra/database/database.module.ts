import { Module } from '@nestjs/common';
import { Logger, LoggerModule } from 'nestjs-pino';
import { EnvironmentModule } from '../../common/environment/environment.module';
import { databaseFactory } from './factory/database.factory';

@Module({
  imports: [EnvironmentModule, LoggerModule.forRoot()],
  providers: [
    {
      provide: 'DATABASE_PROVIDER',
      inject: [Logger, 'DATABASE', 'POSTGRESQL_CONFIG'],
      useFactory: databaseFactory,
    },
  ],
  exports: ['DATABASE_PROVIDER'],
})
export class DatabaseModule {}
