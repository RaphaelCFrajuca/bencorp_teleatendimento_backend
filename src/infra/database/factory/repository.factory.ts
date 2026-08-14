import { Logger } from 'nestjs-pino';
import { Database } from '../interfaces/database.interface';
import { AuditLogRepository } from '../providers/postgresql/repositories/audit-log.repository';
import { ConsultationRepository } from '../providers/postgresql/repositories/consultation.repository';
import { MedicalRecordRepository } from '../providers/postgresql/repositories/medical-record.repository';
import { PatientRepository } from '../providers/postgresql/repositories/patient.repository';
import { UserRepository } from '../providers/postgresql/repositories/user.repository';
import { DatabaseProvider } from './database.factory';

export enum RepositoryName {
  USER = 'user',
  PATIENT = 'patient',
  CONSULTATION = 'consultation',
  MEDICAL_RECORD = 'medical_record',
  AUDIT_LOG = 'audit_log',
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
    case RepositoryName.MEDICAL_RECORD:
      switch (String(database)) {
        case DatabaseProvider.POSTGRESQL:
          return new MedicalRecordRepository(db, logger);
        default:
          logger.error(`Repository ${repository} not implemented for database ${String(database)}`);
          throw new Error(
            `Repository ${repository} not implemented for database ${String(database)}`,
          );
      }
    case RepositoryName.AUDIT_LOG:
      switch (String(database)) {
        case DatabaseProvider.POSTGRESQL:
          return new AuditLogRepository(db, logger);
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
