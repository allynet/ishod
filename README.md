# ishod

ishod is a utility library for working with promises and results.

## Installation

Using your package manager of choice:

<details>
  <summary>npm</summary>

```bash
npm install @allynet/ishod
```

</details>

<details>
  <summary>yarn</summary>

```bash
yarn add @allynet/ishod
```

</details>

<details>
  <summary>pnpm</summary>

```bash
pnpm install @allynet/ishod
```

</details>

<details>
  <summary>bun</summary>

```bash
bun install @allynet/ishod
```

</details>

## Usage

### Result

ishod provides a `Result` type that can be used to represent the result of an operation.

It boils down to the following:

```ts
type Result<T, E> = Ok<T> | Err<E>;

type Ok<T> = { ok: true; data: T };
type Err<E> = { ok: false; error: E };
```

You can use the `ok` and `err` functions to create results:

```ts
const result: Ok<number> = ok(1);
```

```ts
const result: Err<string> = err("error");
```

You can use the `isOk` and `isErr` functions to check the type of a result:

```ts
const isOkOk: true = isOk(ok(1));
const isErrOk: false = isErr(ok(1));
const isErrErr: true = isErr(err("error"));
const isOkErr: false = isOk(err("error"));
```

If you need to get the value from the result, you can use the `unwrap` function:

```ts
const data = unwrap(ok(1));
assert.equal(data, 1);
```

If you need to get the error from the result, you can use the `unwrapErr` function:

```ts
const error = unwrapErr(err("error"));
assert.equal(error, "error");
```

You can use the `unwrapForced` function to force get the data from the result.
It will return the data on OK results, and on Err results it will return undefined.

```ts
const data = unwrapForced(ok(1));
assert.equal(data, 1);

const otherData = unwrapForced(err("error"));
assert.equal(otherData, undefined); // !!
```

You can use the `unwrapOr` function to get the value of a result or a default value:

```ts
const data = unwrapOr(ok(1), 0);
assert.equal(data, 1);

const otherData = unwrapOr(err("error"), 0);
assert.equal(otherData, 0);
```

You can use the `tap` function to run a function on a result if it's ok:

```ts
const result = ok(1);
const data = tap(result, (data) => {
  console.log(data);
});
assert.ok(data === result);
```

The `tap` function won't modify the result.

You can use the `tapErr` function to run a function on an error:

```ts
const result = err("error");
const error = tapErr(result, (error) => {
  console.log(error);
});
assert.ok(error === result);
```

The `tapErr` function won't modify the result.

You can use the `map` function to map a result value:

```ts
const result = ok(1);
const data = map(result, (data) => data * 2);
assert.deepEqual(data, ok(2));
```
