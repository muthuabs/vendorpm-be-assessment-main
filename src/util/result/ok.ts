// eslint-disable-next-line import/no-cycle
import { Result } from '.';
import { AbstractResult } from './abstractResult';

export class OkResult<T, E extends Error> extends AbstractResult<T, E> {
  readonly isOk = true;

  readonly isErr = false;

  constructor(readonly value: T) {
    super();
  }

  protected chain<X, U extends Error>(
    ok: (value: T) => Result<X, U>
  ): Result<X, U> {
    return ok(this.value);
  }
}
