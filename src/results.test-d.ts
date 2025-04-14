import { describe, expectTypeOf, it } from "vitest";
import type { Err, Ok, ResultError, ResultValue } from "./result";

describe("ResultValue", () => {
	it("should be the value if the result is an ok", () => {
		expectTypeOf<ResultValue<Ok<string>>>().toEqualTypeOf<string>();
	});

	it("should be the exact value if the result is an ok of a primitive", () => {
		expectTypeOf<ResultValue<Ok<"a thing">>>().toEqualTypeOf<"a thing">();
	});

	it("should be never if the result is an err", () => {
		expectTypeOf<ResultValue<Err<string>>>().toEqualTypeOf<never>();
	});
});

describe("ResultError", () => {
	it("should be the error if the result is an err", () => {
		expectTypeOf<ResultError<Err<string>>>().toEqualTypeOf<string>();
	});

	it("should be never if the result is an ok", () => {
		expectTypeOf<ResultError<Ok<string>>>().toEqualTypeOf<never>();
	});

	it("should be the exact error if the result is an err of a primitive", () => {
		expectTypeOf<ResultError<Err<"an error">>>().toEqualTypeOf<"an error">();
	});
});
