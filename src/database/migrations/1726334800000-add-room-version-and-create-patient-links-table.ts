import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class AddRoomVersionAndCreatePatientLinksTable1726334800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'consultations',
      new TableColumn({
        name: 'room_version',
        type: 'integer',
        default: 0,
        isNullable: false,
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'patient_links',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'consultation_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'token_hash',
            type: 'varchar',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'used_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'patient_links',
      new TableForeignKey({
        columnNames: ['consultation_id'],
        referencedTableName: 'consultations',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'patient_links',
      new TableIndex({
        name: 'idx_patient_links_consultation_id',
        columnNames: ['consultation_id'],
      }),
    );

    await queryRunner.createIndex(
      'patient_links',
      new TableIndex({
        name: 'idx_patient_links_expires_at',
        columnNames: ['expires_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('patient_links', true);
    await queryRunner.dropColumn('consultations', 'room_version');
  }
}
