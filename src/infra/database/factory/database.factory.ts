import { Logger } from 'nestjs-pino';
import { Database } from '../interfaces/database.interface';
import { PostgresqlConfig } from '../providers/postgresql/interfaces/postgresql-config.interface';
import { PostgresqlProvider } from '../providers/postgresql/postgresql.provider';

export function databaseFactory(
  logger: Logger,
  database: DatabaseProvider | string,
  config: PostgresqlConfig,
): Database {
  switch (database) {
    case DatabaseProvider.POSTGRESQL:
      logger.log(`Using ${database} database provider`);
      return new PostgresqlProvider(config);
    default:
      throw new Error(`Database ${String(database)} not supported`);
  }
}

export enum DatabaseProvider {
  POSTGRESQL = 'postgresql',
}
