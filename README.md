# ishod

`ishod` is a really small (&lt;0.5kb gzipped) and simple utility library for working with promises and results.

It helps you handle errors uniformly and safely across sync and async code.

![npm bundle size](https://img.shields.io/bundlephobia/minzip/%40allynet%2Fishod)
<a href="https://www.npmjs.com/package/@allynet/ishod">![NPM Version](https://img.shields.io/npm/v/%40allynet%2Fishod)</a>

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

## Examples

<details>
<summary>

### Logging errors

without having to try/catch all the time and leave a bunch of `let val = null` variables around

</summary>

```ts
import { $result } from "@allynet/ishod";

// Do an unsafe operation safely
const gamble = $result.try$(() => {
  if (Math.random() > 0.5) {
    return 5;
  }

  throw new Error("error");
});

// And process the result safely
const doubled = $result.map(gamble, (x) => x * 2);

// Or log the error if it happens
$result.tapErr(gamble, (error) => {
  console.error(error);
});

// without having to check everything yourself
// or creating a bunch of `let val = null` variables

```

</details>

<details>
<summary>

### Error handling

uniformly with promises and sync code

</summary>

```ts
import { $result } from "@allynet/ishod";

const requestJson = (url: string) =>
  $result
    .try$(fetch(url))
    .then((x) => $result.map(x, (res) => res.json()))
    .then((x) => $result.tapErr(x, (error) => console.error(error)));

const response = await requestJson("https://api.example.com/data");

if ($result.isOk(response)) {
  const data = $result.unwrap(response);
  console.log(`Got the response data right here: ${data}`);
}
```

</details>

<details>
<summary>

### Returning informative results

instead of just doing `MyThing | null` for everything and praying for the best

</summary>

```ts
import { $result } from "@allynet/ishod";

const divide = (a: number, b: number) => {
  if (b === 0) {
    return $result.err("division by zero");
  }

  if (a === b) {
    return $result.err("division by itself");
  }

  return $result.ok(a / b);
};

const result = divide(1, 0);
//    ^? Result<number, "division by zero" | "division by itself">

const resultDoubled = $result.map(result, (x) => x * 2);
//    ^? Result<number, "division by zero" | "division by itself">
```

</details>

## Docs overview

The full documentation is available at <https://allynet.github.io/ishod/>.

The following is a quick overview of the API.

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

### Tapping

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

### Mapping

You can use the `map` function to map a result value:

```ts
const result = ok(1);
const data = map(result, (data) => data * 2);
assert.deepEqual(data, ok(2));
```

You can use the `mapErr` function to map an error:

```ts
const result = err("error");
const error = mapErr(result, (error) => error.toUpperCase());
assert.deepEqual(error, err("ERROR"));
```
