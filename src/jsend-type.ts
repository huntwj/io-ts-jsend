export const JSEND_SUCCESS = "success";
export const JSEND_FAIL = "fail";
export const JSEND_ERROR = "error";

interface JSendSuccess<TSuccess> {
  status: typeof JSEND_SUCCESS;

  data: TSuccess;
}

interface JSendFail<TFail> {
  status: typeof JSEND_FAIL;

  data: TFail;
}

interface JSendError<TError> {
  status: typeof JSEND_ERROR;

  message: string;

  code?: number;
  data?: TError;
}

export type JSend<TSuccess, TFail = never, TError = never> =
  | JSendSuccess<TSuccess>
  | JSendFail<TFail>
  | JSendError<TError>;
