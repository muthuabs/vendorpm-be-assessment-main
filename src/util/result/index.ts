/* eslint-disable import/no-cycle */
/* eslint-disable @typescript-eslint/no-redeclare */
import { ErrResult } from './error';
import { OkResult } from './ok';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Result {
  export type Ok<T, E extends Error> = OkResult<T, E>;
  export type Err<T, E extends Error> = ErrResult<T, E>;

  export function ok<T, E extends Error>(value: T): Result<T, E> {
    return new OkResult(value);
  }
  export function err<E extends Error, T = never>(error: E): Result<T, E> {
    return new ErrResult(error);
  }
  export async function fromPromise<T, E extends Error>(
    promise: Promise<T>
  ): Promise<Result<T, E>> {
    const resultPromise = (async () => {
      try {
        const value: T = await promise;
        return await new Promise<Result<T, E>>((resolve) => {
          resolve(new OkResult(value));
        });
      } catch (error) {
        return new Promise<Result<T, E>>((resolve) => {
          resolve(new ErrResult(error as unknown as E));
        });
      }
    })();
    return resultPromise;
  }
}

export type Result<T, E extends Error = Error> =
  | Result.Ok<T, E>
  | Result.Err<T, E>;
