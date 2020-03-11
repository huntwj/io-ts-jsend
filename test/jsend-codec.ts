import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import * as t from "io-ts";

import { createRawJSendCodec, fold, JSend } from "../src/index";

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

interface SlightlyComplexType {
  name: string;
  age: number;
  active: boolean;
}
const RawSlightlyComplexJsonCodec = t.type({
  name: t.string,
  age: t.number,
  active: t.boolean,
});
const SlightlyComplexJsonCodec = new t.Type<
  SlightlyComplexType,
  ReturnType<typeof RawSlightlyComplexJsonCodec.encode>
>(
  "SlightlyComplexJsonCodec",
  RawSlightlyComplexJsonCodec.is,
  RawSlightlyComplexJsonCodec.validate,
  RawSlightlyComplexJsonCodec.encode,
);

type SlightlyComplexJSendType = JSend<SlightlyComplexType, string, number>;
const RawSlightlyComplexJSendType = createRawJSendCodec(
  SlightlyComplexJsonCodec,
  t.string,
  t.number,
);
const SlightlyComplexJSendJsonCodec = new t.Type<
  SlightlyComplexJSendType,
  ReturnType<typeof RawSlightlyComplexJSendType.encode>
>(
  "SlightlyComplexJSendType",
  RawSlightlyComplexJSendType.is,
  RawSlightlyComplexJSendType.validate,
  RawSlightlyComplexJSendType.encode,
);

describe("JSend JSON Codec", () => {
  it("should have a JSendResponseCodec exported", () => {
    expect(typeof createRawJSendCodec).not.toBeUndefined();
  });

  describe("Using a simple string success data codec", () => {
    it("it should fail to decode a simple string sans JSend structure", () => {
      expect(
        E.isLeft(
          SimpleJSendCodec.decode(
            "an incorrectly structured message that should be an object",
          ),
        ),
      ).toBe(true);
    });

    describe("success codec", () => {
      it("should reject a success message with the wrong data type", () => {
        const decoded = SimpleJSendCodec.decode({
          status: "success",
          data: 5, // codec expects string here
        });

        expect(E.isRight(decoded)).toBe(false);
      });

      it("should successfully decode a well-structured success message", () => {
        const decoded = SimpleJSendCodec.decode({
          status: "success",
          data: "the message",
        });

        expect(E.isRight(decoded)).toBe(true);
      });
    });

    describe("fail codec", () => {
      it("should reject a fail message with the wrong data type", () => {
        const decoded = SimpleJSendCodec.decode({
          status: "fail",
          data: "wrong data type", // codec expects number here
        });

        expect(E.isRight(decoded)).toBe(false);
      });

      it("should successfully decode a well-structured fail message", () => {
        const decoded = SimpleJSendCodec.decode({
          status: "fail",
          data: 5,
        });

        expect(E.isRight(decoded)).toBe(true);
      });
    });

    describe("error codec", () => {
      it("should reject an error message with wrong data type", () => {
        const decoded = SimpleJSendCodec.decode({
          status: "error",
          data: 5, // codec expects boolean here
        });

        expect(E.isRight(decoded)).toBe(false);
      });

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

  describe("Using a slightly complex interface success data codec", () => {
    describe("success codec", () => {
      it("should reject a success message with the wrong data type", () => {
        const decodec = SlightlyComplexJSendJsonCodec.decode({
          status: "success",
          data: {
            name: "John Doe",
            age: 45.6,
            active: "yes", // this should be a boolean
          },
        });

        expect(E.isRight(decodec)).toBe(false);
      });

      it("should successfully decode a well-structured success message", () => {
        const decoded = SlightlyComplexJSendJsonCodec.decode({
          status: "success",
          data: {
            name: "John Doe",
            age: 45.6,
            active: true,
          },
        });

        pipe(
          decoded,
          // decodec should have type Either<t.Errors, JSend<SlightlyComplexType, string, number>
          E.map(jsendObj =>
            pipe(
              // jsendObj should have type JSend<SlightlyComplexType, string, number>
              jsendObj,
              fold(
                jsendSuccess => {
                  // jsendSuccess should have type JSendSuccess<SlightlyComplexType>
                  const { data } = jsendSuccess;
                  // data should have type SlightlyComplexType
                  const { name, age, active } = data;
                  expect(typeof name).toBe("string");
                  expect(typeof age).toBe("number");
                  expect(typeof active).toBe("boolean");
                },
                jsendFail => {
                  const { data } = jsendFail;
                  // data should have type string
                  expect(typeof data).toBe("string");

                  fail("success status should not fold as fail");
                },
                jsendError => {
                  const { message, code, data } = jsendError;

                  expect(typeof message).toBe("string");
                  expect(typeof code).toBe("number");
                  expect(typeof data).toBe("number");

                  fail("success status should not fold as error");
                },
              ),
            ),
          ),
        );

        expect(E.isRight(decoded)).toBe(true);
      });
    });
    describe("fail codec", () => {
      it("should reject a fail message with the wrong data type", () => {
        const decodec = SlightlyComplexJSendJsonCodec.decode({
          status: "fail",
          data: {
            // data - this should have been a string here
            name: "John Doe",
            age: 45.6,
            active: true,
          },
        });

        expect(E.isRight(decodec)).toBe(false);
      });

      it("should successfully decode a well-structured fail message", () => {
        const decoded = SlightlyComplexJSendJsonCodec.decode({
          status: "fail",
          data: "this is the fail data",
        });

        pipe(
          decoded,
          // decodec should have type Either<t.Errors, JSend<SlightlyComplexType, string, number>
          E.map(jsendObj =>
            pipe(
              // jsendObj should have type JSend<SlightlyComplexType, string, number>
              jsendObj,
              fold(
                jsendSuccess => {
                  // jsendSuccess should have type JSendSuccess<SlightlyComplexType>
                  const { data } = jsendSuccess;
                  // data should have type SlightlyComplexType
                  const { name, age, active } = data;
                  expect(typeof name).toBe("string");
                  expect(typeof age).toBe("number");
                  expect(typeof active).toBe("boolean");

                  fail("fail status should not fold as success");
                },
                jsendFail => {
                  // jsendFail should have type JSendFail<string>
                  const { data } = jsendFail;
                  // data should have type string
                  expect(typeof data).toBe("string");
                },
                jsendError => {
                  // jsendError should have type JSendError<number>
                  const { message, code, data } = jsendError;

                  expect(typeof message).toBe("string");
                  expect(typeof code).toBe("number");
                  expect(typeof data).toBe("number");

                  fail("fail status should not fold as error");
                },
              ),
            ),
          ),
        );

        expect(E.isRight(decoded)).toBe(true);
      });
    });
    describe("error codec", () => {
      it("should reject a error message with the wrong data type", () => {
        const decodec = SlightlyComplexJSendJsonCodec.decode({
          status: "error",
          data: {
            name: "John Doe",
            age: 45.6,
            active: "yes", // this should be a boolean
          },
        });

        expect(E.isRight(decodec)).toBe(false);
      });

      it("should successfully decode a well-structured error message (+code, +data)", () => {
        const decoded = SlightlyComplexJSendJsonCodec.decode({
          status: "error",
          message: "something went wrong",
          code: 404,
          data: 45,
        });

        pipe(
          decoded,
          // decodec should have type Either<t.Errors, JSend<SlightlyComplexType, string, number>
          E.map(jsendObj =>
            pipe(
              // jsendObj should have type JSend<SlightlyComplexType, string, number>
              jsendObj,
              fold(
                jsendSuccess => {
                  // jsendSuccess should have type JSendSuccess<SlightlyComplexType>
                  const { data } = jsendSuccess;
                  // data should have type SlightlyComplexType
                  const { name, age, active } = data;
                  expect(typeof name).toBe("string");
                  expect(typeof age).toBe("number");
                  expect(typeof active).toBe("boolean");

                  fail("error status should not fold as success");
                },
                jsendFail => {
                  const { data } = jsendFail;
                  // data should have type string
                  expect(typeof data).toBe("string");

                  fail("error status should not fold as fail");
                },
                jsendError => {
                  const { message, code, data } = jsendError;

                  expect(typeof message).toBe("string");
                  expect(typeof code).toBe("number");
                  expect(typeof data).toBe("number");
                },
              ),
            ),
          ),
        );

        expect(E.isRight(decoded)).toBe(true);
      });

      it("should successfully decode a well-structured error message (+code, -data)", () => {
        const decoded = SlightlyComplexJSendJsonCodec.decode({
          status: "error",
          message: "something went wrong",
          code: 404,
        });

        pipe(
          decoded,
          // decodec should have type Either<t.Errors, JSend<SlightlyComplexType, string, number>
          E.map(jsendObj =>
            pipe(
              // jsendObj should have type JSend<SlightlyComplexType, string, number>
              jsendObj,
              fold(
                jsendSuccess => {
                  // jsendSuccess should have type JSendSuccess<SlightlyComplexType>
                  const { data } = jsendSuccess;
                  // data should have type SlightlyComplexType
                  const { name, age, active } = data;
                  expect(typeof name).toBe("string");
                  expect(typeof age).toBe("number");
                  expect(typeof active).toBe("boolean");

                  fail("error status should not fold as success");
                },
                jsendFail => {
                  const { data } = jsendFail;
                  // data should have type string
                  expect(typeof data).toBe("string");

                  fail("error status should not fold as fail");
                },
                jsendError => {
                  const { message, code, data } = jsendError;
                  // message should havbe type string;
                  // code should have type number | undefined
                  // data should have type number | undefined

                  expect(typeof message).toBe("string");
                  expect(typeof code).toBe("number");
                  expect(typeof data).toBe("undefined");
                },
              ),
            ),
          ),
        );

        expect(E.isRight(decoded)).toBe(true);
      });

      it("should successfully decode a well-structured error message (-code, +data)", () => {
        const decoded = SlightlyComplexJSendJsonCodec.decode({
          status: "error",
          message: "something went wrong",
          data: 45,
        });

        pipe(
          decoded,
          // decodec should have type Either<t.Errors, JSend<SlightlyComplexType, string, number>
          E.map(jsendObj =>
            pipe(
              // jsendObj should have type JSend<SlightlyComplexType, string, number>
              jsendObj,
              fold(
                jsendSuccess => {
                  // jsendSuccess should have type JSendSuccess<SlightlyComplexType>
                  const { data } = jsendSuccess;
                  // data should have type SlightlyComplexType
                  const { name, age, active } = data;
                  expect(typeof name).toBe("string");
                  expect(typeof age).toBe("number");
                  expect(typeof active).toBe("boolean");

                  fail("error status should not fold as success");
                },
                jsendFail => {
                  const { data } = jsendFail;
                  // data should have type string
                  expect(typeof data).toBe("string");

                  fail("error status should not fold as fail");
                },
                jsendError => {
                  const { message, code, data } = jsendError;

                  expect(typeof message).toBe("string");
                  expect(typeof code).toBe("undefined");
                  expect(typeof data).toBe("number");
                },
              ),
            ),
          ),
        );

        expect(E.isRight(decoded)).toBe(true);
      });

      it("should successfully decode a well-structured error message (-code, -data)", () => {
        const decoded = SlightlyComplexJSendJsonCodec.decode({
          status: "error",
          message: "something went wrong",
        });

        pipe(
          decoded,
          // decodec should have type Either<t.Errors, JSend<SlightlyComplexType, string, number>
          E.map(jsendObj =>
            pipe(
              // jsendObj should have type JSend<SlightlyComplexType, string, number>
              jsendObj,
              fold(
                jsendSuccess => {
                  // jsendSuccess should have type JSendSuccess<SlightlyComplexType>
                  const { data } = jsendSuccess;
                  // data should have type SlightlyComplexType
                  const { name, age, active } = data;
                  expect(typeof name).toBe("string");
                  expect(typeof age).toBe("number");
                  expect(typeof active).toBe("boolean");

                  fail("error status should not fold as success");
                },
                jsendFail => {
                  const { data } = jsendFail;
                  // data should have type string
                  expect(typeof data).toBe("string");

                  fail("error status should not fold as fail");
                },
                jsendError => {
                  const { message, code, data } = jsendError;
                  // message should have type string
                  // code should have type number | undefined
                  // data should have type number | undefined

                  expect(typeof message).toBe("string");
                  expect(typeof code).toBe("undefined");
                  expect(typeof data).toBe("undefined");
                },
              ),
            ),
          ),
        );

        expect(E.isRight(decoded)).toBe(true);
      });
    });
  });
});
