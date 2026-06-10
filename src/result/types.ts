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
export type Ok<T> = { ok: true; data: T };
/**
 * An `Err` is a type that represents a failed result.
 *
 * @example
 * ```ts
 * const errResult: Err<string> = err("error");
 * ```
 */
export type Err<E> = { ok: false; error: E };

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
 * Definition for a function that can be used to tap into a result.
 *
 * @see {@link tap}
 * @see {@link tapErr}
 */
export type TapFn<T> = (data: T) => void;
