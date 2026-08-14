import { Module } from '@nestjs/common';
import { Logger, LoggerModule } from 'nestjs-pino';
import { EnvironmentModule } from '../../common/environment/environment.module';
import { databaseFactory } from './factory/database.factory';
import { RepositoryName, repositoryFactory } from './factory/repository.factory';
import { Database } from './interfaces/database.interface';

@Module({
  imports: [EnvironmentModule, LoggerModule.forRoot()],
  providers: [
    {
      provide: 'DATABASE_PROVIDER',
      inject: [Logger, 'DATABASE', 'POSTGRESQL_CONFIG'],
      useFactory: databaseFactory,
    },
    {
      provide: 'USER_REPOSITORY',
      inject: ['DATABASE', 'DATABASE_PROVIDER', Logger],
      useFactory: (databaseToken: string, db: Database, logger: Logger) =>
        repositoryFactory(databaseToken, RepositoryName.USER, db, logger),
    },
    {
      provide: 'PATIENT_REPOSITORY',
      inject: ['DATABASE', 'DATABASE_PROVIDER', Logger],
      useFactory: (databaseToken: string, db: Database, logger: Logger) =>
        repositoryFactory(databaseToken, RepositoryName.PATIENT, db, logger),
    },
    {
      provide: 'CONSULTATION_REPOSITORY',
      inject: ['DATABASE', 'DATABASE_PROVIDER', Logger],
      useFactory: (databaseToken: string, db: Database, logger: Logger) =>
        repositoryFactory(databaseToken, RepositoryName.CONSULTATION, db, logger),
    },
  ],
  exports: ['DATABASE_PROVIDER', 'USER_REPOSITORY', 'PATIENT_REPOSITORY', 'CONSULTATION_REPOSITORY'],
})
export class DatabaseModule {}
