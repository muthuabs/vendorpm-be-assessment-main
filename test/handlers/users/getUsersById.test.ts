import { getUserById } from '../../../src/handlers';
import { closeDataSource } from '../../../src/data-source';
import { setupLogger } from '../../../src/util/logger';

// Its expected that the handlers auto start the datasource themselves, but we
// are expected to close the datasource in all the tests
afterAll(async () => {
  await closeDataSource();
});

describe('getUserById', () => {
  const logger = setupLogger();

  it('should return a 404 for a non existent id', async () => {
    expect.assertions(1);

    const result = await getUserById(logger, { userId: 0 });

    expect(result).toStrictEqual({
      statusCode: 404,
      headers: { 'content-type': 'application/json' },
      body: '{"message":"User not found!"}',
    });
  });

  it('should return the user as expected for known to exist users', async () => {
    expect.assertions(1);

    const result = await getUserById(logger, { userId: 1 });

    expect(result).toStrictEqual({
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: '{"id":1,"firstName":"Alice","lastName":"one","age":24}',
    });
  });
});
