import {
  Column,
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
} from 'typeorm';

export class alterUserTable1678294444907 implements MigrationInterface {
  name = 'alterUserTable1678294444907';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('user', [
      // new TableColumn({
      //   name: 'birthdate',
      //   type: 'timestamp',
      //   isNullable: false,
      // }),

      new TableColumn({
        name: 'version',
        type: 'int',
        default: 1,
        isNullable: false,
      }),
    ]);
    // await queryRunner.dropColumn('user', 'age');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // await queryRunner.addColumn(
    //   'user',
    //   new TableColumn({
    //     name: 'age',
    //     type: 'int',
    //     isNullable: false,
    //     default: 24,
    //   })
    // );

    await queryRunner.dropColumns('user', ['version']);
  }
}
