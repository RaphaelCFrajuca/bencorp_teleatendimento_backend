import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreatePatientsTable1726334400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'patients',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'cpf',
            type: 'varchar',
            length: '11',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['ativo', 'inativo'],
            isNullable: false,
            default: "'ativo'",
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
      'patients',
      new TableIndex({
        name: 'idx_patients_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'patients',
      new TableIndex({
        name: 'idx_patients_email',
        columnNames: ['email'],
      }),
    );

    await queryRunner.createIndex(
      'patients',
      new TableIndex({
        name: 'idx_patients_cpf',
        columnNames: ['cpf'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('patients', true);
  }
}
