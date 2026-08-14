import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateMedicalRecordsTable1726334600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'medical_records',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'consultation_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'professional_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'patient_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['rascunho', 'finalizado'],
            isNullable: false,
            default: "'rascunho'",
          },
          {
            name: 'diagnose',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'treatment',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'observations',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'medical_records',
      new TableIndex({
        name: 'idx_medical_records_consultation_id',
        columnNames: ['consultation_id'],
      }),
    );

    await queryRunner.createIndex(
      'medical_records',
      new TableIndex({
        name: 'idx_medical_records_professional_id',
        columnNames: ['professional_id'],
      }),
    );

    await queryRunner.createIndex(
      'medical_records',
      new TableIndex({
        name: 'idx_medical_records_patient_id',
        columnNames: ['patient_id'],
      }),
    );

    await queryRunner.createIndex(
      'medical_records',
      new TableIndex({
        name: 'idx_medical_records_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX idx_medical_records_consultation_unique ON medical_records(consultation_id)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('medical_records', true);
  }
}
