import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateAuditLogsTable1726334700000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'audit_logs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'user_role',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'patient_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'medical_record_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'action',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'endpoint',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'method',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'status_code',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'ip_address',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'user_agent',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
        indices: [
          {
            columnNames: ['user_id'],
            name: 'IDX_AUDIT_LOGS_USER_ID',
          },
          {
            columnNames: ['patient_id'],
            name: 'IDX_AUDIT_LOGS_PATIENT_ID',
          },
          {
            columnNames: ['medical_record_id'],
            name: 'IDX_AUDIT_LOGS_MEDICAL_RECORD_ID',
          },
          {
            columnNames: ['created_at'],
            name: 'IDX_AUDIT_LOGS_CREATED_AT',
          },
          {
            columnNames: ['action'],
            name: 'IDX_AUDIT_LOGS_ACTION',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('audit_logs');
  }
}
