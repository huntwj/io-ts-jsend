import * as E from "fp-ts/lib/Either";
import * as t from "io-ts";

import * as J from "../src/index";

describe("Placeholder jsend codec test", () => {
  it("should have a JSendResponseCodec exported", () => {
    expect(typeof J.createJSendResponseCodec).not.toBeUndefined();
  });
  describe("Using a string data codec", () => {
    const codec = J.createJSendResponseCodec(t.string);

    it("it should fail to decode a simple string", () => {
      expect(
        E.isLeft(
          codec.decode(
            "an incorrectly structured message that should be an object",
          ),
        ),
      ).toBe(true);
    });

    it("should successfully decode a well-structured message", () => {
      expect(
        E.isRight(
          codec.decode({
            status: "success",
            data: "the message",
          }),
        ),
      ).toBe(true);
    });
  });
});
