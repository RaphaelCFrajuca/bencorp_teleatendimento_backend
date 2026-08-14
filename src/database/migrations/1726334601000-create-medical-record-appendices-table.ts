import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateMedicalRecordAppendicesTable1726334601000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'medical_record_appendices',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'medical_record_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'professional_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'content',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'reason',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'medical_record_appendices',
      new TableIndex({
        name: 'idx_medical_record_appendices_record_id',
        columnNames: ['medical_record_id'],
      }),
    );

    await queryRunner.createIndex(
      'medical_record_appendices',
      new TableIndex({
        name: 'idx_medical_record_appendices_professional_id',
        columnNames: ['professional_id'],
      }),
    );

    await queryRunner.query(
      `ALTER TABLE medical_record_appendices ADD CONSTRAINT fk_appendices_medical_record FOREIGN KEY (medical_record_id) REFERENCES medical_records(id) ON DELETE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('medical_record_appendices', true);
  }
}
