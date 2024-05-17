// eslint-disable-next-line import/no-cycle
import { Result } from '.';

export abstract class AbstractResult<T, E extends Error> {
  protected abstract chain<X, U extends Error>(
    ok: (value: T) => Result<X, U>,
    err: (error: E) => Result<X, U>
  ): Result<X, U>;

  unwrap(ok?: (value: T) => unknown, err?: (error: E) => unknown): unknown {
    const r = this.chain(
      (value) => {
        return Result.ok(ok ? ok(value) : value);
      },
      (error) => {
        return err ? Result.ok(err(error)) : Result.err(error);
      }
    );
    if (r.isErr) {
      throw r.error;
    }
    return r.value;
  }

  map(ok: (value: T) => unknown, err?: (error: E) => Error): Result<unknown> {
    return this.chain(
      (value) => {
        return Result.ok(ok(value));
      },
      (error) => {
        return Result.err(err ? err(error) : error);
      }
    );
  }
}
