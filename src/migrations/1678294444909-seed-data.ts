import { MigrationInterface, QueryRunner } from 'typeorm';

export class seedUserData1678294444909 implements MigrationInterface {
  name = 'seedUserData1678294444909';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.connection
      .createQueryBuilder()
      .insert()
      .into('user', ['firstName', 'lastName', 'age'])
      .values([
        {
          firstName: 'Alice',
          lastName: 'one',
          age: 10,
        },
        {
          firstName: 'Bob',
          lastName: 'two',
          age: 20,
        },
        {
          firstName: 'Candice',
          lastName: 'three',
          age: 33,
        },
        {
          firstName: 'Derek',
          lastName: 'four',
          age: 20,
        },
      ])
      .execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.clearTable('user');
  }
}
