// eslint-disable-next-line import/no-cycle
import { Result } from '.';
import { AbstractResult } from './abstractResult';

export class ErrResult<T, E extends Error> extends AbstractResult<T, E> {
  readonly isOk = false;

  readonly isErr = true;

  constructor(readonly error: E) {
    super();
  }

  protected chain<X, U extends Error>(
    _ok: (value: T) => Result<X, U>,
    err: (error: E) => Result<X, U>
  ): Result<X, U> {
    return err(this.error);
  }
}
