import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm/data-source/DataSource.js';
import { Database } from '../../interfaces/database.interface';
import { UserEntity } from './entities/user.entity';
import type { PostgresqlConfig } from './interfaces/postgresql-config.interface';

@Injectable()
export class PostgresqlProvider implements Database {
  private dataSource: DataSource;
  private initializing?: Promise<DataSource>;

  constructor(private readonly postgresqlConfig: PostgresqlConfig) {
    this.dataSource = new DataSource({
      type: 'postgres',
      host: this.postgresqlConfig.host,
      port: this.postgresqlConfig.port,
      username: this.postgresqlConfig.user,
      password: this.postgresqlConfig.password,
      database: this.postgresqlConfig.database,
      entities: [UserEntity],
      synchronize: true,
    });
  }

  async connect(): Promise<DataSource> {
    if (this.dataSource.isInitialized) return this.dataSource;

    if (this.initializing) return this.initializing;

    this.initializing = this.dataSource.initialize().finally(() => {
      this.initializing = undefined;
    });

    return this.initializing;
  }

  async disconnect(): Promise<void> {
    if (this.dataSource.isInitialized) {
      await this.dataSource.destroy();
    }
  }
}
