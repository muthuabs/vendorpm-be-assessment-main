import { getUsers, pageValidator } from '../../../src/handlers';
import { closeDataSource } from '../../../src/data-source';
import { setupLogger } from '../../../src/util/logger';

// Its expected that the handlers auto start the datasource themselves, but we
// are expected to close the datasource in all the tests
afterAll(async () => {
  await closeDataSource();
});

describe('getUsers', () => {
  const logger = setupLogger();
  it('should return all users', async () => {
    expect.assertions(4);

    let result = await getUsers(logger, {});

    expect(result).toStrictEqual({
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: '{"remainingPages":0,"data":[{"id":1,"firstName":"Alice","lastName":"one","age":24},{"id":2,"firstName":"Bob","lastName":"two","age":24},{"id":3,"firstName":"Candice","lastName":"three","age":24},{"id":4,"firstName":"Derek","lastName":"four","age":24}]}',
    });

    result = await getUsers(logger, { page: 0, pageSize: 2 });
    expect(result).toStrictEqual({
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: '{"remainingPages":1,"data":[{"id":1,"firstName":"Alice","lastName":"one","age":24},{"id":2,"firstName":"Bob","lastName":"two","age":24}]}',
    });

    result = await getUsers(logger, { page: 1, pageSize: 2 });
    expect(result).toStrictEqual({
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: '{"remainingPages":0,"data":[{"id":3,"firstName":"Candice","lastName":"three","age":24},{"id":4,"firstName":"Derek","lastName":"four","age":24}]}',
    });

    result = await getUsers(logger, {
      page: 1,
      pageSize: 10,
    });
    expect(result).toStrictEqual({
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: '{"remainingPages":0,"data":[]}',
    });
  });
});

describe('Get Users validation test', () => {
  it('without any parameter', () => {
    expect.assertions(2);
    const response = pageValidator.safeParse({});
    expect(response.success).toBe(true);
    if (response.success) {
      expect(response.data).toEqual({});
    }
  });

  describe('page', () => {
    it('#numeric', () => {
      expect.assertions(2);
      const response = pageValidator.safeParse({
        page: 1,
      });
      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data).toEqual({
          page: 1,
        });
      }
    });

    it('#string', () => {
      expect.assertions(2);
      const response = pageValidator.safeParse({
        page: '1',
      });
      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data).toEqual({
          page: 1,
        });
      }
    });

    it('#invalid string', () => {
      expect.assertions(1);
      const response = pageValidator.safeParse({
        page: 'invalid',
      });
      expect(response.success).toBe(false);
    });
  });

  describe('pageSize', () => {
    it('#numeric', () => {
      expect.assertions(2);
      const response = pageValidator.safeParse({
        pageSize: 1,
      });
      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data).toEqual({
          pageSize: 1,
        });
      }
    });

    it('#string', () => {
      expect.assertions(2);
      const response = pageValidator.safeParse({
        pageSize: '1',
      });
      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data).toEqual({
          pageSize: 1,
        });
      }
    });

    it('#invalid string', () => {
      expect.assertions(1);
      const response = pageValidator.safeParse({
        pageSize: 'invalid',
      });
      expect(response.success).toBe(false);
    });
  });
});
