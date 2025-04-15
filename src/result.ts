import { type Primitive, isPromise } from "./helpers";

/**
 * @internal
 * This type is used to create a result.
 * It's not exported, so you shouldn't use it directly.
 */
export type result<OK extends boolean, T = never, E = never> = OK extends true
  ? {
      ok: OK;
      data: T;
    }
  : {
      ok: OK;
      error: E;
    };

/**
 * A result is a type that can be either an `Ok` or an `Err`.
 *
 * It represents the result of an operation.
 *
 * The two variants are mutually exclusive.
 *
 * @example
 * ```ts
 * const result: Result<number, string> = ok(1);
 * const error: Result<number, string> = err("error");
 * ```
 * @example
 * ```ts
 * const tryResult: Result<number, unknown> = try$(() => {
 * 	return 1;
 * });
 * ```
 */
export type Result<T, E = unknown> = Ok<T> | Err<E>;
/**
 * An `Ok` is a type that represents a successful result.
 *
 * @example
 * ```ts
 * const okResult: Ok<number> = ok(1);
 * ```
 */
export type Ok<T> = result<true, T>;
/**
 * An `Err` is a type that represents a failed result.
 *
 * @example
 * ```ts
 * const errResult: Err<string> = err("error");
 * ```
 */
export type Err<E> = result<false, never, E>;

/**
 * This type is used to get the value of a result.
 *
 * @example
 * ```ts
 * const thing: Result<number, string> = ok(1);
 * type ResultType = ResultValue<typeof thing>; // number
 * ```
 */
// biome-ignore lint/suspicious/noExplicitAny: This is required to properly implement some generics
export type ResultValue<TResult extends Result<any, any>> = TResult extends Ok<
  infer D
>
  ? D
  : never;
/**
 * This type is used to get the error of a result.
 *
 * @example
 * ```ts
 * const thing: Result<number, string> = err("error");
 * type ResultError = ResultError<typeof thing>; // string
 * ```
 */
// biome-ignore lint/suspicious/noExplicitAny: This is required to properly implement some generics
export type ResultError<TResult extends Result<any, any>> = TResult extends Err<
  infer E
>
  ? E
  : never;

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
 * const result: Result<number, string> = ok(1);
 * const value: number = unwrap(result); // 1
 * ```
 *
 * @see {@link unwrapErr}
 * @see {@link unwrapOr}
 */
export function unwrap<T>(result: Ok<T>): T {
  return result.data;
}

/**
 * Get the error value from an `Err` result.
 *
 * @example
 * ```ts
 * const result: Result<number, string> = err("error");
 * const error: string = unwrapErr(result); // "error"
 * ```
 *
 * @see {@link unwrap}
 * @see {@link unwrapOr}
 */
export function unwrapErr<E>(result: Err<E>): E {
  return result.error;
}

/**
 * Force unwrap a result.
 *
 * If the result is an `Ok`, it will return the value.
 *
 * If the result is an `Err`, it will return `undefined`.
 *
 * You probably shouldn't use this function (and use {@link unwrap} or {@link unwrapErr} instead), but it's here if you need it.
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
 *
 * @see {@link unwrap}
 */
export function unwrapForced<T, E>(ok: Ok<T>): T;
export function unwrapForced<T, E>(err: Err<E>): undefined;
export function unwrapForced<T, E>(result: Result<T, E>): T | undefined {
  return (result as Ok<T>).data;
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
 *
 * @see {@link unwrap}
 * @see {@link unwrapErr}
 * @see {@link unwrapForced}
 */
export function unwrapOr<T, E, U, TResult extends Result<T, E>>(
  result: TResult,
  or: U,
): TResult extends Ok<infer D> ? D : U {
  if (isOk(result)) {
    return result.data as never;
  }

  return or as never;
}

/**
 * @internal
 * Definition for a function that can be used to tap into a result.
 *
 * @see {@link tap}
 * @see {@link tapErr}
 */
export type TapFn<T> = (data: T) => void;

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
  fn: (data: T) => U,
): Promise<Result<U, E>>;
export function map<T, E, const U extends Primitive>(
  result: Result<T, E>,
  fn: (data: T) => U,
): Result<U, E>;
export function map<T, E, U>(
  result: Promise<Result<T, E>>,
  fn: (data: T) => U,
): Promise<Result<Awaited<U>, E>>;
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
    return ok(fn(result.data));
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
  fn: (data: E) => U,
): Result<T, U>;
export function mapErr<T, E, U>(
  result: Promise<Result<T, E>>,
  fn: (data: E) => U,
): Promise<Result<T, U>>;
export function mapErr<T, E, U>(
  result: Result<T, E>,
  fn: (data: E) => U,
): Result<T, U>;
export function mapErr<T, E, U>(
  result: Promise<Result<T, E>> | Result<T, E>,
  fn: (data: E) => U,
): Result<T, U> | Promise<Result<T, U>> {
  if (isPromise(result)) {
    return result.then((x) => mapErr(x, fn));
  }

  if (isErr(result)) {
    return err(fn(result.error));
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
  fn: Promise<T> | (() => T),
): Promise<Result<T, E>> | Result<T, E> {
  if (isPromise(fn)) {
    return fn.then(ok).catch(err) as Promise<Result<T, E>>;
  }

  try {
    const res = (fn as () => unknown)();

    if (isPromise<T>(res)) {
      return try$(res);
    }

    return ok(res) as Result<T, E>;
  } catch (e) {
    return err(e) as Result<T, E>;
  }
}
