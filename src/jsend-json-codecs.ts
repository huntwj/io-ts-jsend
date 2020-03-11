import * as t from "io-ts";

const createJSendSuccessCodec = <C extends t.Mixed>(codec: C) =>
  t.type({
    status: t.literal("success"),

    data: codec,
  });

const createJSendFailCodec = <C extends t.Mixed>(codec: C) =>
  t.type({
    status: t.literal("fail"),

    data: codec,
  });

const createJSendErrorCodec = <C extends t.Mixed>(codec: C) =>
  t.intersection([
    t.type({
      status: t.literal("error"),

      message: t.string,
    }),
    t.partial({
      code: t.number,
      data: codec,
    }),
  ]);

export const createRawJSendCodec = <
  C extends t.Mixed,
  TFailCodec extends t.Mixed,
  TErrorCodec extends t.Mixed
>(
  successCodec: C,
  failCodec: TFailCodec,
  errorCodec: TErrorCodec,
) =>
  t.union([
    createJSendSuccessCodec(successCodec),
    createJSendFailCodec(failCodec),
    createJSendErrorCodec(errorCodec),
  ]);
