import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PostgresqlConfig } from '../../infra/database/providers/postgresql/interfaces/postgresql-config.interface';

@Module({
  imports: [ConfigModule.forRoot({ envFilePath: '.env' })],
  controllers: [],
  providers: [
    {
      provide: 'POSTGRESQL_CONFIG',
      useValue: {
        host: process.env.POSTGRESQL_HOST,
        port: parseInt(process.env.POSTGRESQL_PORT!, 10),
        user: process.env.POSTGRESQL_USER,
        password: process.env.POSTGRESQL_PASSWORD,
        database: process.env.POSTGRESQL_DB,
      } as unknown as PostgresqlConfig,
    },
    {
      provide: 'DATABASE',
      useValue: process.env.DATABASE,
    },
    {
      provide: 'JWT_SECRET',
      useValue: process.env.JWT_SECRET,
    },
  ],
  exports: ['POSTGRESQL_CONFIG', 'DATABASE', 'JWT_SECRET'],
})
export class EnvironmentModule {}
