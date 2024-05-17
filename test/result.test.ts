import { Result } from '../src/util/result/index';

const ERROR = new Error('test');
describe('Result', () => {
  describe('ok', () => {
    it('isOk equals true', () => {
      const r = Result.ok(1);
      expect(r.isOk).toBe(true);
    });

    it('isErr equals false', () => {
      const r = Result.ok(1);
      expect(r.isErr).toBe(false);
    });
  });

  describe('err', () => {
    it('isOk equals false', () => {
      const r = Result.err(ERROR);
      expect(r.isOk).toBe(false);
    });

    it('isErr equals true', () => {
      const r = Result.err(ERROR);
      expect(r.isErr).toBe(true);
    });
  });

  describe('#unwrap', () => {
    it('returns the wrapped value with 0 args', () => {
      const r = Result.ok(1);
      expect(r.unwrap()).toEqual(1);
    });
    it('returns a mapped value with 1 arg', () => {
      const r = Result.ok(1);
      expect(
        r.unwrap((v) => {
          return v + 1;
        })
      ).toEqual(2);
    });
    it('returns a mapped value with 2 args', () => {
      const r = Result.ok(1);
      expect(
        r.unwrap(
          (v) => {
            return v + 1;
          },
          (e) => {
            return 0;
          }
        )
      ).toEqual(2);
    });
    it('throws errors raised in a mapping function', () => {
      const r = Result.ok(1);
      expect(() => {
        return r.unwrap((v) => {
          throw ERROR;
        });
      }).toThrow(ERROR);
    });
  });

  describe('#fromPromise', () => {
    const getHeroPromise = async (hero: string) => {
      return new Promise<string>((res) => {
        setTimeout(() => {
          return res(hero);
        }, 10);
      });
    };

    const getErrorPromise = async () => {
      return new Promise<string>((_, reject) => {
        setTimeout(() => {
          return reject(ERROR);
        }, 10);
      });
    };

    it('returns okay', async () => {
      const r = await Result.fromPromise(getHeroPromise('Ironman'));
      expect(r.isOk).toEqual(true);
      expect(r.isErr).toEqual(false);
      expect(r.unwrap()).toEqual('Ironman');
      expect(
        r.unwrap((result: string) => {
          return `My Hero: ${result}`;
        })
      ).toEqual('My Hero: Ironman');
    });

    it('returns error', async () => {
      const r = await Result.fromPromise(getErrorPromise());
      expect(r.isOk).toEqual(false);
      expect(r.isErr).toEqual(true);
      expect(() => {
        return r.unwrap();
      }).toThrowError(ERROR);
    });
  });
});
