import * as E from "fp-ts/lib/Either";
import * as t from "io-ts";

import * as J from "../src/index";
import { createRawJSendCodec, JSend } from "../src/index";

type SimpleJSendType = JSend<string, number, boolean>;

const RawSimpleJSendCodec = createRawJSendCodec(t.string, t.number, t.boolean);

const SimpleJSendCodec = new t.Type<
  SimpleJSendType,
  ReturnType<typeof RawSimpleJSendCodec.encode>
>(
  "SimpleJSendJsonCodec",
  RawSimpleJSendCodec.is,
  RawSimpleJSendCodec.validate,
  RawSimpleJSendCodec.encode,
);

describe("JSend JSON Codec", () => {
  it("should have a JSendResponseCodec exported", () => {
    expect(typeof J.createRawJSendCodec).not.toBeUndefined();
  });
  describe("Using a string data codec", () => {
    it("it should fail to decode a simple string", () => {
      expect(
        E.isLeft(
          SimpleJSendCodec.decode(
            "an incorrectly structured message that should be an object",
          ),
        ),
      ).toBe(true);
    });

    it("should successfully decode a well-structured success message", () => {
      const decoded = SimpleJSendCodec.decode({
        status: "success",
        data: "the message",
      });

      expect(E.isRight(decoded)).toBe(true);
    });

    it("should successfully decode a well-structured fail message", () => {
      const decoded = SimpleJSendCodec.decode({
        status: "fail",
        data: 5,
      });

      expect(E.isRight(decoded)).toBe(true);
    });

    it("should reject an error message with wrong data type", () => {
      const decoded = SimpleJSendCodec.decode({
        status: "error",
        data: 5,
      });

      expect(E.isRight(decoded)).toBe(false);
    });

    describe("error messages", () => {
      it("should successfully decode a well-structured error message", () => {
        const decoded = SimpleJSendCodec.decode({
          status: "error",
          message: "data is invalid here",
          data: false,
        });

        expect(E.isRight(decoded)).toBe(true);
      });
    });
  });
});
