import { type Primitive, isPromise } from "../helpers";
import type { Err, Ok, Result, TapFn } from "./types";

/**
 * Create an `Ok` variant.
 *
 * @example
 * ```ts
 * const okResult: Ok<number> = ok(1);
 * const okResult2: Ok<string> = ok("hello");
 * const okResult3: Ok<boolean> = ok(true);
 * const okResult4: Ok<"it worked!"> = ok("it worked!");
 * ```
 */
export function ok<const T extends Primitive>(data: T): Ok<T>;
export function ok<T>(data: T): Ok<T>;
export function ok<T>(data: T): Ok<T> {
  return {
    ok: true,
    data: data,
  };
}

/**
 * Create an `Err` variant.
 *
 * @example
 * ```ts
 * const errResult: Err<string> = err("error");
 * const errResult2: Err<number> = err(1);
 * const errResult3: Err<boolean> = err(true);
 * const errResult4: Err<"it failed!"> = err("it failed!");
 * ```
 */
export function err<const E extends Primitive>(error: E): Err<E>;
export function err<E>(error: E): Err<E>;
export function err<E>(error: E): Err<E> {
  return {
    ok: false,
    error: error,
  };
}

/**
 * Used to check if a result is an `Ok`.
 *
 * @example
 * ```ts
 * const result: Result<number, string> = ok(1);
 * const isOkResult: boolean = isOk(result); // true
 * ```
 * @example
 * ```ts
 * if (isOk(result)) {
 * 	// We now know that the result is an Ok
 *  // so we can safely use it
 * 	const value: number = unwrap(result); // 1
 * }
 * ```
 */
export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.ok;
}

/**
 * Used to check if a result is an `Err`.
 *
 * @example
 * ```ts
 * const result: Result<number, string> = err("error");
 * const isErrResult: boolean = isErr(result); // true
 * ```
 * @example
 * ```ts
 * if (isErr(result)) {
 * 	// We now know that the result is an Err
 *  // so we can safely use it
 * 	const error: string = unwrapErr(result); // "error"
 * }
 * ```
 */
export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return !result.ok;
}

/**
 * Get the data from an `Ok` result.
 *
 * @example
 * ```ts
 * const result = ok(1);
 * const value: number = unwrap(result); // 1
 * ```
 * @example
 * ```ts
 * const result = Promise.resolve(ok(1));
 * const value: Promise<number> = unwrap(result); // Promise<1>
 * ```
 *
 * @see {@link unwrapErr}
 * @see {@link unwrapOr}
 */
export function unwrap<T>(result: Ok<T>): T;
export function unwrap<T>(result: Promise<Ok<T>>): Promise<T>;
export function unwrap<T>(result: Ok<T> | Promise<Ok<T>>): T | Promise<T> {
  if (isPromise(result)) {
    return result.then((x) => unwrap(x));
  }

  return result.data;
}

/**
 * Get the error value from an `Err` result.
 *
 * @example
 * ```ts
 * const result = err("error");
 * const error: string = unwrapErr(result); // "error"
 * ```
 * @example
 * ```ts
 * const result = Promise.resolve(err("error"));
 * const error: Promise<string> = unwrapErr(result); // Promise<"error">
 * ```
 *
 * @see {@link unwrap}
 * @see {@link unwrapOr}
 */
export function unwrapErr<E>(err: Promise<Err<E>>): Promise<E>;
export function unwrapErr<E>(err: Err<E>): E;
export function unwrapErr<E>(err: Err<E> | Promise<Err<E>>): E | Promise<E> {
  if (isPromise(err)) {
    return err.then((x) => unwrapErr(x));
  }

  return err.error;
}

/**
 * Force unwrap a result.
 * You probably shouldn't use this function and use {@link unwrap} or {@link unwrapErr} instead.
 *
 * If the result is an `Ok`, it will return the value.
 *
 * If the result is an `Err`, it will return `undefined`.
 *
 * @example
 * ```ts
 * const result: Result<number, string> = ok(1);
 * const value = unwrapForced(result); // 1
 * ```
 * @example
 * ```ts
 * const result: Result<number, string> = err("error");
 * const value = unwrapForced(result); // undefined
 * ```
 * @example
 * ```ts
 * const result: Promise<Result<number, string>> = Promise.resolve(ok(1));
 * const value: Promise<number> = unwrapForced(result); // Promise<1>
 * ```
 * @example
 * ```ts
 * const result: Promise<Result<number, string>> = Promise.resolve(err("error"));
 * const value: Promise<undefined> = unwrapForced(result); // Promise<undefined>
 * ```
 *
 * @see {@link unwrap}
 */
export function unwrapForced<T, E>(ok: Promise<Ok<T>>): Promise<T>;
export function unwrapForced<T, E>(ok: Ok<T>): T;
export function unwrapForced<T, E>(err: Promise<Err<E>>): Promise<undefined>;
export function unwrapForced<T, E>(err: Err<E>): undefined;
export function unwrapForced<T, E>(
  result: Promise<Result<T, E>>,
): Promise<T | undefined>;
export function unwrapForced<T, E>(result: Result<T, E>): T | undefined;
export function unwrapForced<T, E>(
  result: Result<T, E> | Promise<Result<T, E>>,
): T | undefined | Promise<T | undefined> {
  if (isPromise(result)) {
    return result.then((x) => unwrapForced(x));
  }

  return (result as Ok<T>).data;
}

/**
 * Unwrap a result and return either the data or the error.
 * You probably shouldn't use this function and use {@link unwrap} or {@link unwrapErr} instead.
 *
 * If the result is an `Ok`, it will return the data.
 *
 * If the result is an `Err`, it will return the error.
 *
 * @example
 * ```ts
 * const result: Result<1, string> = ok(1);
 * const value: 1 | string = unwrapEither(result); // 1
 * ```
 * @example
 * ```ts
 * const result: Result<number, "error"> = err("error");
 * const value: number | "error" = unwrapEither(result); // "error"
 * ```
 * @example
 * ```ts
 * const result: Promise<Result<number, string>> = Promise.resolve(ok(1));
 * const value: Promise<1 | string> = unwrapEither(result); // Promise<1>
 * ```
 * @example
 * ```ts
 * const result: Promise<Result<number, string>> = Promise.resolve(err("error"));
 * const value: Promise<number | string> = unwrapEither(result); // Promise<"error">
 * ```
 *
 * @see {@link unwrap}
 * @see {@link unwrapErr}
 */
export function unwrapEither<T, E>(ok: Promise<Ok<T>>): Promise<T>;
export function unwrapEither<T, E>(ok: Ok<T>): T;
export function unwrapEither<T, E>(err: Promise<Err<E>>): Promise<E>;
export function unwrapEither<T, E>(err: Err<E>): E;
export function unwrapEither<T, E>(
  result: Promise<Result<T, E>>,
): Promise<T | E>;
export function unwrapEither<T, E>(result: Result<T, E>): T | E;
export function unwrapEither<T, E>(
  result: Result<T, E> | Promise<Result<T, E>>,
): T | E | Promise<T | E> {
  if (isPromise(result)) {
    return result.then((x) => unwrapEither(x));
  }

  if (isOk(result)) {
    return result.data;
  }

  return result.error;
}

/**
 * Unwrap a result and return a default value if the result is an `Err`.
 *
 * @example
 * ```ts
 * const result: Result<number, string> = err("error");
 * const value = unwrapOr(result, 0); // 0
 * ```
 * @example
 * ```ts
 * const result: Result<number, string> = ok(1);
 * const value = unwrapOr(result, 0); // 1
 * ```
 * @example
 * ```ts
 * const result: Promise<Result<number, string>> = Promise.resolve(err("error"));
 * const value: Promise<number> = unwrapOr(result, 0); // Promise<0>
 * ```
 * @example
 * ```ts
 * const result: Promise<Result<number, string>> = Promise.resolve(ok(1));
 * const value: Promise<number> = unwrapOr(result, 0); // Promise<1>
 * ```
 *
 * @see {@link unwrap}
 * @see {@link unwrapErr}
 * @see {@link unwrapForced}F
 */
export function unwrapOr<T, E, U>(ok: Promise<Ok<T>>, or: U): Promise<T>;
export function unwrapOr<T, E, U>(ok: Ok<T>, or: U): T;
export function unwrapOr<T, E, const U extends Primitive>(
  err: Promise<Err<E>>,
  or: U,
): Promise<U>;
export function unwrapOr<T, E, U>(err: Promise<Err<E>>, or: U): Promise<U>;
export function unwrapOr<T, E, const U extends Primitive>(
  err: Err<E>,
  or: U,
): U;
export function unwrapOr<T, E, U>(err: Err<E>, or: U): U;
export function unwrapOr<T, E, U>(result: Result<T, E>, or: U): T | U;
export function unwrapOr<T, E, U>(
  result: Promise<Result<T, E>>,
  or: U,
): Promise<T | U>;
export function unwrapOr<T, E, U>(
  result: Promise<Result<T, E>> | Result<T, E>,
  or: U,
): T | U | Promise<T | U> {
  if (isPromise(result)) {
    return result.then((x) => unwrapOr(x, or));
  }

  if (isOk(result)) {
    return result.data;
  }

  return or;
}

/**
 * Tap into a result.
 *
 * If the result is an `Ok`, the function will be called with the data the result contains.
 *
 * Otherwise nothing will happen.
 *
 * It will not modify the result, and just return the original result.
 *
 * @example
 * ```ts
 * const result: Result<number, string> = ok(1);
 * const value = tap(result, (data) => {
 * 	console.log(data);
 * });
 * // `1` gets logged by the callback;
 * result === value; // true
 * ```
 *
 * @example
 * ```ts
 * const result: Result<number, string> = err("error");
 * const value = tap(result, (data) => {
 * 	console.log(data);
 * });
 * // Nothing gets logged by the callback;
 * result === value; // true
 * ```
 *
 * @see {@link map}
 * @see {@link tapErr}
 */
export function tap<T, E>(
  result: Promise<Result<T, E>>,
  fn: TapFn<T>,
): Promise<Result<T, E>>;
export function tap<T, E>(result: Result<T, E>, fn: TapFn<T>): Result<T, E>;
export function tap<T, E>(
  result: Result<T, E> | Promise<Result<T, E>>,
  fn: TapFn<T>,
): Result<T, E> | Promise<Result<T, E>> {
  if (isPromise(result)) {
    return result.then((x) => tap(x, fn));
  }

  if (isOk(result)) {
    fn(result.data);
  }

  return result;
}

/**
 * Tap into an `Err` result.
 *
 * If the result is an `Err`, the function will be called with the error the result contains.
 *
 * Otherwise nothing will happen.
 *
 * It will not modify the result, and just return the original result.
 *
 * @example
 * ```ts
 * const result: Result<number, string> = err("error");
 * const value = tapErr(result, (error) => {
 * 	console.log(error);
 * });
 * // "error" gets logged by the callback;
 * result === value; // true
 * ```
 * @example
 * ```ts
 * const result: Result<number, string> = ok(1);
 * const value = tapErr(result, (error) => {
 * 	console.log(error);
 * });
 * // Nothing gets logged by the callback;
 * result === value; // true
 * ```
 *
 * @see {@link tap}
 * @see {@link mapErr}
 */
export function tapErr<T, E>(
  result: Promise<Result<T, E>>,
  fn: TapFn<E>,
): Promise<Result<T, E>>;
export function tapErr<T, E>(result: Result<T, E>, fn: TapFn<E>): Result<T, E>;
export function tapErr<T, E>(
  result: Result<T, E> | Promise<Result<T, E>>,
  fn: TapFn<E>,
): Result<T, E> | Promise<Result<T, E>> {
  if (isPromise(result)) {
    return result.then((x) => tapErr(x, fn));
  }

  if (isErr(result)) {
    fn(result.error);
  }

  return result;
}

/**
 * Map result data.
 *
 * If the result is an `Ok`, the function will be called with the data the result contains.
 *
 * The result of the function will then be returned as a new `Ok` result.
 *
 * On an `Err`, the function will not be called, and the original `Err` will be returned.
 *
 * @example
 * ```ts
 * const result: Result<1, "error"> = ok(1);
 * const value = map(result, (data) => {
 *  console.log(data);
 * 	return (data + 1) as 2;
 * });
 * // `1` gets logged by the callback;
 * typeof value; // Result<2, "error">
 * ```
 * @example
 * ```ts
 * const result: Result<1, "error"> = err("error");
 * const value = map(result, (data) => {
 *  console.log(data);
 * 	return (data + 1) as 2;
 * });
 * // Nothing gets logged by the callback;
 * typeof value; // Result<2, "error">
 * ```
 */
export function map<T, E, const U extends Primitive>(
  result: Promise<Result<T, E>>,
  fn: (data: T) => U | Promise<U>,
): Promise<Result<U, E>>;
export function map<T, E, const U extends Primitive>(
  result: Result<T, E>,
  fn: (data: T) => Promise<U>,
): Promise<Result<U, E>>;
export function map<T, E, const U extends Primitive>(
  result: Result<T, E>,
  fn: (data: T) => U,
): Result<U, E>;
export function map<T, E, U>(
  result: Promise<Result<T, E>>,
  fn: (data: T) => U | Promise<U>,
): Promise<Result<U, E>>;
export function map<T, E, U>(
  result: Result<T, E>,
  fn: (data: T) => Promise<U>,
): Promise<Result<U, E>>;
export function map<T, E, U>(
  result: Result<T, E>,
  fn: (data: T) => U,
): Result<U, E>;
export function map<T, E, U>(
  result: Promise<Result<T, E>> | Result<T, E>,
  fn: (data: T) => U,
): Result<U, E> | Promise<Result<U, E>> {
  if (isPromise(result)) {
    return result.then((x) => map(x, fn));
  }

  if (isOk(result)) {
    return try$(() => fn(result.data));
  }

  return result;
}

/**
 * Map result error.
 *
 * If the result is an `Err`, the function will be called with the error the result contains.
 *
 * The result of the function will then be returned as a new `Err` result.
 *
 * On an `Ok`, the function will not be called, and the original `Ok` will be returned.
 *
 * @example
 * ```ts
 * const result: Result<1, "error"> = err("error");
 * const value = mapErr(result, (error) => {
 * 	console.log(error);
 * 	return "new error" as const;
 * });
 * // "error" gets logged by the callback;
 * typeof value; // Result<1, "new error">
 * ```
 * @example
 * ```ts
 * const result: Result<1, "error"> = ok(1);
 * const value = mapErr(result, (error) => {
 * 	console.log(error);
 * 	return "new error" as const;
 * });
 * // Nothing gets logged by the callback;
 * typeof value; // Result<1, "new error">
 * ```
 */
export function mapErr<T, E, const U extends Primitive>(
  result: Promise<Result<T, E>>,
  fn: (data: E) => U,
): Promise<Result<T, U>>;
export function mapErr<T, E, const U extends Primitive>(
  result: Result<T, E>,
  fn: (data: E) => Promise<U>,
): Promise<Result<T, U>>;
export function mapErr<T, E, const U extends Primitive>(
  result: Result<T, E>,
  fn: (data: E) => U,
): Result<T, U>;
export function mapErr<T, E, U>(
  result: Promise<Result<T, E>>,
  fn: (data: E) => U | Promise<U>,
): Promise<Result<T, U>>;
export function mapErr<T, E, U>(
  result: Result<T, E>,
  fn: (data: E) => Promise<U>,
): Promise<Result<T, U>>;
export function mapErr<T, E, U>(
  result: Result<T, E>,
  fn: (data: E) => U,
): Result<T, U>;
export function mapErr<T, E, U>(
  result: Promise<Result<T, E>> | Result<T, E>,
  fn: (data: E) => U | Promise<U>,
): Result<T, U> | Promise<Result<T, U>> {
  if (isPromise(result)) {
    return result.then((x) => mapErr(x, fn)) as Promise<Result<T, U>>;
  }

  if (isErr(result)) {
    /*
     * Result is either Ok<fn result> | Err<some error>.
     * Since we're mapping over the error anyway either value is useful here.
     * We either get the error we got sent in or a new error from the callback that we report right back.
     */
    const r = try$(() => fn(result.error));
    const v = unwrapEither(r) as U | Promise<U>;

    if (isPromise(v)) {
      return v.then((x) => err(x));
    }

    return err(v);
  }

  return result;
}

/**
 * Try to map a result.
 *
 * Works similarly to the {@link map} function, but the callback returns a result.
 *
 * The returned result is treated as the new result.
 *
 * If the original result is an `Err`, the callback will not be called, and the original `Err` will be returned.
 *
 * @example
 * ```ts
 * const result = tryMap(ok(1), (data) => {
 *  return ok(data + 1);
 * });
 * // result is an Ok with the value 2;
 * ```
 *
 * @example
 * ```ts
 * const result = tryMap(err("error"), (data) => {
 *  return ok(data + 1);
 * });
 * // result is an Err with the error "error";
 * ```
 *
 * @example
 * ```ts
 * const result = tryMap(ok(1), (data) => {
 *  return err("new error");
 * });
 * // result is an Err with the error "new error";
 * ```
 */
export function tryMap<
  T,
  E,
  const TT extends Primitive,
  const EE extends Primitive,
>(
  result: Promise<Result<T, E>>,
  fn: (data: T) => Result<TT, EE>,
): Promise<Result<TT, E | EE>>;
export function tryMap<
  T,
  E,
  const TT extends Primitive,
  const EE extends Primitive,
>(result: Result<T, E>, fn: (data: T) => Result<TT, EE>): Result<TT, E | EE>;
export function tryMap<T, E, const TT extends Primitive, EE>(
  result: Promise<Result<T, E>>,
  fn: (data: T) => Result<TT, EE>,
): Promise<Result<TT, E | EE>>;
export function tryMap<T, E, const TT extends Primitive, EE>(
  result: Result<T, E>,
  fn: (data: T) => Result<TT, EE>,
): Result<TT, E | EE>;
export function tryMap<T, E, TT, const EE extends Primitive>(
  result: Promise<Result<T, E>>,
  fn: (data: T) => Result<TT, EE>,
): Promise<Result<TT, E | EE>>;
export function tryMap<T, E, TT, const EE extends Primitive>(
  result: Result<T, E>,
  fn: (data: T) => Result<TT, EE>,
): Result<TT, E | EE>;
export function tryMap<T, E, TT, EE>(
  result: Promise<Result<T, E>>,
  fn: (data: T) => Result<TT, EE>,
): Promise<Result<TT, E | EE>>;
export function tryMap<T, E, TT, EE>(
  result: Result<T, E>,
  fn: (data: T) => Result<TT, EE>,
): Result<TT, E | EE>;
export function tryMap<T, E, TT, EE>(
  result: Promise<Result<T, E>> | Result<T, E>,
  fn: (data: T) => Promise<Result<TT, EE>> | Result<TT, EE>,
): Result<TT, E | EE> | Promise<Result<TT, E | EE>> {
  if (isPromise(result)) {
    return result.then((x) => tryMap(x, fn as never)) as never;
  }

  if (isOk(result)) {
    return fn(result.data);
  }

  return result;
}

/**
 * Try to run a function and return a result.
 *
 * If the function throws an error, it will be caught and returned as an `Err`.
 *
 * @example
 * ```ts
 * const result = try$(() => {
 * 	return 1;
 * });
 * // result is an Ok with the value 1;
 * ```
 * @example
 * ```ts
 * const result = try$(() => {
 * 	throw new Error("error");
 * });
 * // result is an Err with the error "error";
 * ```
 * @example
 * ```ts
 * const result: Promise<Result<number, string>> = try$(Promise.resolve(1));
 * // result is an Ok with the value 1;
 * ```
 * @example
 * ```ts
 * const result: Promise<Result<number, string>> = try$(Promise.reject("error"));
 * // result is an Err with the error "error";
 * ```
 *
 * @see {@link map}
 * @see {@link mapErr}
 * @see {@link tap}
 * @see {@link tapErr}
 */
export function try$<const T extends Primitive, E>(fn: () => T): Result<T, E>;
export function try$<T, E>(fn: Promise<T>): Promise<Result<T, E>>;
export function try$<T, E>(fn: () => Promise<T>): Promise<Result<T, E>>;
export function try$<T, E>(fn: () => T): Result<T, E>;
export function try$<T, E>(
  fn: Promise<T> | (() => T | Promise<T>),
): Promise<Result<T, E>> | Result<T, E> {
  if (isPromise(fn)) {
    return fn.then(ok).catch(err) as Promise<Result<T, E>>;
  }

  try {
    const res = fn();

    if (isPromise(res)) {
      return try$(res);
    }

    return ok(res);
  } catch (e) {
    return err(e as E);
  }
}
