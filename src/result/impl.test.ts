import { describe, expect, it, vi } from "vitest";
import * as $result from "./impl";

describe("result", () => {
  it.each([
    [$result.ok("ok"), '{"ok":true,"data":"ok"}'],
    [$result.err("err"), '{"ok":false,"error":"err"}'],
  ])("should stringify nicely: %p", (result, expected) => {
    expect(JSON.stringify(result)).toBe(expected);
  });
});

describe("isOk", () => {
  it("should return true if the result is an ok", () => {
    const value = Symbol("value");

    expect($result.isOk($result.ok(value))).toBe(true);
  });

  it("should return false if the result is an err", () => {
    const error = Symbol("error");

    expect($result.isOk($result.err(error))).toBe(false);
  });
});

describe("isErr", () => {
  it("should return true if the result is an err", () => {
    const error = Symbol("error");

    expect($result.isErr($result.err(error))).toBe(true);
  });

  it("should return false if the result is an ok", () => {
    const value = Symbol("value");

    expect($result.isErr($result.ok(value))).toBe(false);
  });
});

describe("unwrap", () => {
  it("should return the value if the result is an ok", () => {
    const value = Symbol("value");

    expect($result.unwrap($result.ok(value))).toBe(value);
  });
});

describe("unwrapErr", () => {
  it("should return the error if the result is an err", () => {
    const error = Symbol("error");

    expect($result.unwrapErr($result.err(error))).toBe(error);
  });
});

describe("unwrapForced", () => {
  it("should return the value if the result is an ok", () => {
    const value = Symbol("value");

    expect($result.unwrapForced($result.ok(value))).toBe(value);
  });

  it("should return undefined if the result is an err", () => {
    const error = Symbol("error");

    expect($result.unwrapForced($result.err(error))).toBeUndefined();
  });
});

describe("unwrapEither", () => {
  it("should return the value if the result is an ok", () => {
    const value = Symbol("value");

    expect($result.unwrapEither($result.ok(value))).toBe(value);
  });

  it("should return the error if the result is an err", () => {
    const error = Symbol("error");

    expect($result.unwrapEither($result.err(error))).toBe(error);
  });

  it("should return the value if the result is an ok promise", async () => {
    const value = Symbol("value");

    await expect(
      $result.unwrapEither(Promise.resolve($result.ok(value))),
    ).resolves.toBe(value);
  });

  it("should return the error if the result is an err promise", async () => {
    const error = Symbol("error");

    await expect(
      $result.unwrapEither(Promise.resolve($result.err(error))),
    ).resolves.toBe(error);
  });
});

describe("try$", () => {
  it("should return the value if it succeeds", () => {
    const value = Symbol("value");

    expect($result.try$(() => value)).toStrictEqual($result.ok(value));
  });

  it("should return the promise value if it succeeds", async () => {
    const value = Symbol("value");

    await expect($result.try$(Promise.resolve(value))).resolves.toStrictEqual(
      $result.ok(value),
    );
  });

  it("should return the error if the function throws", async () => {
    const error = Symbol("error");

    expect(
      $result.try$(() => {
        throw error;
      }),
    ).toStrictEqual($result.err(error));

    await expect(
      $result.try$(async () => {
        throw error;
      }),
    ).resolves.toStrictEqual($result.err(error));
  });

  it("should return the promise rejection if the promise rejects", async () => {
    const error = Symbol("error");

    await expect($result.try$(Promise.reject(error))).resolves.toStrictEqual(
      $result.err(error),
    );
  });
});

describe("map", () => {
  it("should map the value if it succeeds", () => {
    const value = Symbol("value");
    const mapped = Symbol("mapped");
    const fn = vi.fn().mockReturnValue(mapped);

    expect($result.map($result.ok(value), fn)).toStrictEqual(
      $result.ok(mapped),
    );
  });

  it("should map the promise value if it succeeds", async () => {
    const value = Symbol("value");
    const mapped = Symbol("mapped");
    const fn = vi.fn().mockReturnValue(mapped);

    await expect(
      $result.map(Promise.resolve($result.ok(value)), fn),
    ).resolves.toStrictEqual($result.ok(mapped));
  });

  it("should not map if the result is an err", async () => {
    const value = Symbol("value");

    expect($result.map($result.err(value), vi.fn())).toStrictEqual(
      $result.err(value),
    );
  });

  it("should not map if the result is an err promise", async () => {
    const value = Symbol("value");

    await expect(
      $result.map(Promise.resolve($result.err(value)), vi.fn()),
    ).resolves.toStrictEqual($result.err(value));
  });
});

describe("mapErr", () => {
  it("should map the error if it succeeds", () => {
    const value = Symbol("value");
    const mapped = Symbol("mapped");
    const fn = vi.fn().mockReturnValue(mapped);

    expect($result.mapErr($result.err(value), fn)).toStrictEqual(
      $result.err(mapped),
    );
  });

  it("should map the promise error if it succeeds", async () => {
    const value = Symbol("value");
    const mapped = Symbol("mapped");
    const fn = vi.fn().mockReturnValue(mapped);

    await expect(
      $result.mapErr(Promise.resolve($result.err(value)), fn),
    ).resolves.toStrictEqual($result.err(mapped));
  });

  it("should not map if the result is an ok", async () => {
    const value = Symbol("value");

    expect($result.mapErr($result.ok(value), vi.fn())).toStrictEqual(
      $result.ok(value),
    );
  });

  it("should not map if the result is an ok promise", async () => {
    const value = Symbol("value");

    await expect(
      $result.mapErr(Promise.resolve($result.ok(value)), vi.fn()),
    ).resolves.toStrictEqual($result.ok(value));
  });
});

describe("tap", () => {
  it("should run the function if the result is OK", () => {
    const value = Symbol("value");
    const fn = vi.fn();

    $result.tap($result.ok(value), fn);

    expect(fn).toHaveBeenCalledWith(value);
  });

  it("should run the function if the promise result is OK", async () => {
    const value = Symbol("value");
    const fn = vi.fn();

    await $result.tap(Promise.resolve($result.ok(value)), fn);

    expect(fn).toHaveBeenCalledWith(value);
  });

  it("should not run the function if the result is an err", () => {
    const value = Symbol("value");
    const fn = vi.fn();

    $result.tap($result.err(value), fn);

    expect(fn).not.toHaveBeenCalled();
  });

  it("should not run the function if the promise result is an err", async () => {
    const value = Symbol("value");
    const fn = vi.fn();

    await $result.tap(Promise.resolve($result.err(value)), fn);

    expect(fn).not.toHaveBeenCalled();
  });

  it.each([[$result.ok("ok")], [$result.err("err")]])(
    "should never modify the result: %o",
    (result) => {
      const fn = vi.fn();

      expect($result.tap(result, fn)).toStrictEqual(result);
    },
  );
});

describe("tapErr", () => {
  it("should run the function if the result is an err", () => {
    const value = Symbol("value");
    const fn = vi.fn();

    $result.tapErr($result.err(value), fn);

    expect(fn).toHaveBeenCalledWith(value);
  });

  it("should run the function if the promise result is an err", async () => {
    const value = Symbol("value");
    const fn = vi.fn();

    await $result.tapErr(Promise.resolve($result.err(value)), fn);

    expect(fn).toHaveBeenCalledWith(value);
  });

  it("should not run the function if the result is OK", () => {
    const value = Symbol("value");
    const fn = vi.fn();

    $result.tapErr($result.ok(value), fn);

    expect(fn).not.toHaveBeenCalled();
  });

  it("should not run the function if the promise result is OK", async () => {
    const value = Symbol("value");
    const fn = vi.fn();

    await $result.tapErr(Promise.resolve($result.ok(value)), fn);

    expect(fn).not.toHaveBeenCalled();
  });

  it.each([[$result.ok("ok")], [$result.err("err")]])(
    "should never modify the result: %o",
    (result) => {
      const fn = vi.fn();

      expect($result.tapErr(result, fn)).toStrictEqual(result);
    },
  );
});

describe("unwrapOr", () => {
  it("should return the value if the result is an ok", () => {
    const value = Symbol("value");
    const result = $result.ok(value);

    expect($result.unwrapOr(result, Symbol("fallback"))).toStrictEqual(value);
  });

  it("should return the fallback if the result is an err", () => {
    const fallback = Symbol("fallback");
    const result = $result.err(Symbol("value"));

    expect($result.unwrapOr(result, fallback)).toStrictEqual(fallback);
  });
});
