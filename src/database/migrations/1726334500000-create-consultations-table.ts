import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateConsultationsTable1726334500000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'consultations',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'patient_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'professional_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['aguardando', 'em_andamento', 'finalizado', 'cancelado'],
            isNullable: false,
            default: "'aguardando'",
          },
          {
            name: 'transferred_to_id',
            type: 'uuid',
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
          {
            name: 'finalised_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'consultations',
      new TableIndex({
        name: 'idx_consultations_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'consultations',
      new TableIndex({
        name: 'idx_consultations_patient_id',
        columnNames: ['patient_id'],
      }),
    );

    await queryRunner.createIndex(
      'consultations',
      new TableIndex({
        name: 'idx_consultations_professional_id',
        columnNames: ['professional_id'],
      }),
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX idx_professional_in_progress ON consultations(professional_id) WHERE status='em_andamento'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('consultations', true);
  }
}
