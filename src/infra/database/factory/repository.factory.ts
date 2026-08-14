import { Logger } from 'nestjs-pino';
import { Database } from '../interfaces/database.interface';
import { PatientRepository } from '../providers/postgresql/repositories/patient.repository';
import { UserRepository } from '../providers/postgresql/repositories/user.repository';
import { ConsultationRepository } from '../providers/postgresql/repositories/consultation.repository';
import { DatabaseProvider } from './database.factory';

export enum RepositoryName {
  USER = 'user',
  PATIENT = 'patient',
  CONSULTATION = 'consultation',
}

export function repositoryFactory(
  database: DatabaseProvider | string,
  repository: RepositoryName,
  db: Database,
  logger: Logger,
): unknown {
  switch (repository) {
    case RepositoryName.USER:
      switch (String(database)) {
        case DatabaseProvider.POSTGRESQL:
          return new UserRepository(db, logger);
        default:
          logger.error(`Repository ${repository} not implemented for database ${String(database)}`);
          throw new Error(
            `Repository ${repository} not implemented for database ${String(database)}`,
          );
      }
    case RepositoryName.PATIENT:
      switch (String(database)) {
        case DatabaseProvider.POSTGRESQL:
          return new PatientRepository(db, logger);
        default:
          logger.error(`Repository ${repository} not implemented for database ${String(database)}`);
          throw new Error(
            `Repository ${repository} not implemented for database ${String(database)}`,
          );
      }
    case RepositoryName.CONSULTATION:
      switch (String(database)) {
        case DatabaseProvider.POSTGRESQL:
          return new ConsultationRepository(db, logger);
        default:
          logger.error(`Repository ${repository} not implemented for database ${String(database)}`);
          throw new Error(
            `Repository ${repository} not implemented for database ${String(database)}`,
          );
      }
    default:
      logger.error(`Repository ${repository} not implemented for database ${String(database)}`);
      throw new Error(`Unknown repository requested: ${String(repository)}`);
  }
}
