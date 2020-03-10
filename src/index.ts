import * as t from "io-ts";

export const createJSendResponseCodec = <C extends t.Mixed>(codec: C) =>
  t.type({
    status: t.literal("success"),

    data: codec,
  });
