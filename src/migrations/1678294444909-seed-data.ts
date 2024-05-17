import { MigrationInterface, QueryRunner } from 'typeorm';

export class seedUserData1678294444909 implements MigrationInterface {
  name = 'seedUserData1678294444909';

  public async up(queryRunner: QueryRunner): Promise<void> {
    
    await queryRunner.connection
    .createQueryBuilder()
    .insert()
    .into("user", ['firstName', 'lastName', 'birthdate'])
    .values([
      {
        firstName: 'Alice',
        lastName: 'one',
        birthdate: new Date("2000-01-01")
      },
      {
        firstName: 'Bob',
        lastName: 'two',
        birthdate: new Date("2000-01-01")
      },
      {
        firstName: 'Candice',
        lastName: 'three',
        birthdate: new Date("2000-01-01")
      },
      {
        firstName: 'Derek',
        lastName: 'four',
        birthdate: new Date("2000-01-01")
      }
    ])
    .execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.clearTable('user');
  }
}
