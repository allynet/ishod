import type { Err, Ok, Result, ResultError, ResultValue } from "@allynet/ishod";
import {
  $r,
  $result,
  err,
  isErr,
  isOk,
  ishod,
  map,
  mapErr,
  ok,
  result,
  tap,
  tapErr,
  try$,
  tryMap,
  unwrap,
  unwrapEither,
  unwrapErr,
  unwrapForced,
  unwrapOr,
} from "@allynet/ishod";
import { describe, expect, expectTypeOf, it } from "vitest";

describe("ok", () => {
  it("creates an Ok result", () => {
    const r = ok(42);
    expect(r.ok).toBe(true);
    expect(r.data).toBe(42);
  });

  it("creates an Ok with a string", () => {
    const r = ok("hello");
    expect(r.data).toBe("hello");
  });
});

describe("err", () => {
  it("creates an Err result", () => {
    const r = err("failed");
    expect(r.ok).toBe(false);
    expect(r.error).toBe("failed");
  });

  it("creates an Err with an Error object", () => {
    const e = new Error("boom");
    const r = err(e);
    expect(r.error).toBe(e);
  });
});

describe("isOk / isErr", () => {
  it("narrows type with isOk", () => {
    const r: Result<number, string> = ok(1);
    if (isOk(r)) {
      expectTypeOf(r.data).toEqualTypeOf<number>();
      expect(r.data).toBe(1);
    }
  });

  it("narrows type with isErr", () => {
    const r: Result<number, string> = err("nope");
    if (isErr(r)) {
      expectTypeOf(r.error).toEqualTypeOf<string>();
      expect(r.error).toBe("nope");
    }
  });
});

describe("unwrap", () => {
  it("returns the data from an Ok", () => {
    expect(unwrap(ok(99))).toBe(99);
  });

  it("returns the error from an Err with unwrapErr", () => {
    expect(unwrapErr(err("bad"))).toBe("bad");
  });
});

describe("unwrapOr", () => {
  it("returns data from Ok", () => {
    expect(unwrapOr(ok(10), 0)).toBe(10);
  });

  it("returns default from Err", () => {
    expect(unwrapOr(err("nope"), 0)).toBe(0);
  });
});

describe("unwrapForced", () => {
  it("returns data from Ok", () => {
    expect(unwrapForced(ok("yes"))).toBe("yes");
  });

  it("returns undefined from Err", () => {
    expect(unwrapForced(err("no"))).toBeUndefined();
  });
});

describe("unwrapEither", () => {
  it("returns data from Ok", () => {
    expect(unwrapEither(ok(1))).toBe(1);
  });

  it("returns error from Err", () => {
    expect(unwrapEither(err("e"))).toBe("e");
  });
});

describe("map", () => {
  it("transforms Ok data", () => {
    const r = map(ok(5), (n) => n * 2);
    expect(r).toEqual(ok(10));
  });

  it("passes through Err unchanged", () => {
    const r = map(err<string>("fail"), (_n) => "unused");
    expect(r).toEqual(err("fail"));
  });
});

describe("mapErr", () => {
  it("transforms Err", () => {
    const r = mapErr(err("e"), (e) => `Error: ${e}`);
    expect(r).toEqual(err("Error: e"));
  });

  it("passes through Ok unchanged", () => {
    const r = mapErr(ok(42), (e) => `Error: ${e}`);
    expect(r).toEqual(ok(42));
  });
});

describe("tap / tapErr", () => {
  it("tap calls fn on Ok and returns original", () => {
    let called = false;
    const r = tap(ok(1), () => {
      called = true;
    });
    expect(called).toBe(true);
    expect(r).toEqual(ok(1));
  });

  it("tap skips fn on Err", () => {
    let called = false;
    const r = tap(err("e"), () => {
      called = true;
    });
    expect(called).toBe(false);
    expect(r).toEqual(err("e"));
  });

  it("tapErr calls fn on Err and returns original", () => {
    let captured = "";
    const r = tapErr(err("e"), (e) => {
      captured = e;
    });
    expect(captured).toBe("e");
    expect(r).toEqual(err("e"));
  });

  it("tapErr skips fn on Ok", () => {
    let called = false;
    const r = tapErr(ok(1), () => {
      called = true;
    });
    expect(called).toBe(false);
    expect(r).toEqual(ok(1));
  });
});

describe("try$", () => {
  it("returns Ok on success", () => {
    const r = try$(() => 42);
    expect(r).toEqual(ok(42));
  });

  it("returns Err on throw", () => {
    const r = try$(() => {
      throw new Error("boom");
    });
    expect(isErr(r)).toBe(true);
  });

  it("handles promises", async () => {
    const r = await try$(Promise.resolve("value"));
    expect(r).toEqual(ok("value"));
  });
});

describe("tryMap", () => {
  it("maps Ok to new Result", () => {
    const r = tryMap(ok(1), (n) => ok(n + 1));
    expect(r).toEqual(ok(2));
  });

  it("passes through Err", () => {
    const r = tryMap(err("fail" as string), (_n) => ok(1));
    expect(r).toEqual(err("fail"));
  });
});

describe("namespace exports", () => {
  it("result namespace contains all functions", () => {
    expect(typeof result.ok).toBe("function");
    expect(typeof result.err).toBe("function");
    expect(typeof result.unwrap).toBe("function");
    expect(typeof result.try$).toBe("function");
  });

  it("$result, ishod, $r are aliases for result", () => {
    expect($result).toBe(result);
    expect(ishod).toBe(result);
    expect($r).toBe(result);
  });
});

describe("type utilities", () => {
  it("ResultValue extracts Ok data type", () => {
    expectTypeOf<ResultValue<Ok<string>>>().toEqualTypeOf<string>();
    expectTypeOf<ResultValue<Err<string>>>().toEqualTypeOf<never>();
  });

  it("ResultError extracts Err error type", () => {
    expectTypeOf<ResultError<Err<string>>>().toEqualTypeOf<string>();
    expectTypeOf<ResultError<Ok<string>>>().toEqualTypeOf<never>();
  });

  it("Result is Ok | Err", () => {
    const r1: Result<number, string> = ok(1);
    const r2: Result<number, string> = err("e");
    expect(isOk(r1)).toBe(true);
    expect(isErr(r2)).toBe(true);
  });
});
