export function isPromise<T = unknown>(value: unknown): value is Promise<T> {
  return Boolean(
    value && typeof value === "object" && "then" in value && "catch" in value,
  );
}

/**
 * List of primitive types.
 */
export type Primitive =
  | null
  | undefined
  | string
  | number
  | boolean
  | symbol
  | bigint;
