import {
  UpdateUserByIdInput,
  getUsers,
  updateUsersById,
  updateUsersByIdValidator,
} from '../../../src/handlers';
import { closeDataSource } from '../../../src/data-source';
import { setupLogger } from '../../../src/util/logger';

// Its expected that the handlers auto start the datasource themselves, but we
// are expected to close the datasource in all the tests
afterAll(async () => {
  await closeDataSource();
});

describe('updateUsers', () => {
  describe('input validation ', () => {
    it('empty object should fail', () => {
      expect.assertions(1);
      const response = updateUsersByIdValidator.safeParse({});
      expect(response.success).toBe(false);
    });

    it('invalid userId ', () => {
      expect.assertions(1);
      const response = updateUsersByIdValidator.safeParse({
        userId: 'abc',
      });
      expect(response.success).toBe(false);
    });

    it('valid userId ', () => {
      expect.assertions(4);
      let response = updateUsersByIdValidator.safeParse({
        userId: '3',
      });
      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data).toStrictEqual({
          userId: 3,
        });
      }

      response = updateUsersByIdValidator.safeParse({
        userId: 3,
      });
      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data).toStrictEqual({
          userId: 3,
        });
      }
    });

    it('valid firstName ', () => {
      expect.assertions(4);
      let response = updateUsersByIdValidator.safeParse({
        userId: '3',
        firstName: 'UpdateName',
      });
      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data).toStrictEqual({
          userId: 3,
          firstName: 'UpdateName',
        });
      }

      response = updateUsersByIdValidator.safeParse({
        userId: 3,
        firstName: 'UpdateName',
      });
      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data).toStrictEqual({
          userId: 3,
          firstName: 'UpdateName',
        });
      }
    });

    it('valid lastName ', () => {
      expect.assertions(2);
      const response = updateUsersByIdValidator.safeParse({
        userId: 3,
        lastName: 'UpdateLastName',
      });
      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data).toStrictEqual({
          userId: 3,
          lastName: 'UpdateLastName',
        });
      }
    });

    it('invalid extra property ', () => {
      const response = updateUsersByIdValidator.safeParse({
        userId: 3,
        property: 'property',
      });
      expect(response.success).toBe(false);
    });
  });

  const logger = setupLogger();
  it("should update user's firstname with Id ", async () => {
    expect.assertions(1);

    const result = await updateUsersById(logger, {
      userId: 1,
      firstName: 'UpdatedName',
    });

    expect(result).toStrictEqual({
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: '{"id":1,"firstName":"UpdatedName","lastName":"one","age":24}',
    });
  });

  it("should update user's lastName with Id ", async () => {
    expect.assertions(1);

    const result = await updateUsersById(logger, {
      userId: 1,
      lastName: 'uLastName',
    });

    expect(result).toStrictEqual({
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: '{"id":1,"firstName":"UpdatedName","lastName":"uLastName","age":24}',
    });
  });

  it("should update user's lastName with Id ", async () => {
    expect.assertions(1);

    const result = await updateUsersById(logger, {
      userId: 1,
      age: 29,
    });

    expect(result).toStrictEqual({
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: '{"id":1,"firstName":"UpdatedName","lastName":"uLastName","age":34}',
    });
  });
});
