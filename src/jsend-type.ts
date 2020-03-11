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

type SuccessHandler<TSuccess, TReturn> = (_: JSendSuccess<TSuccess>) => TReturn;
type FailHandler<TFail, TReturn> = (_: JSendFail<TFail>) => TReturn;
type ErrorHandler<TError, TReturn> = (_: JSendError<TError>) => TReturn;

export const fold = <TSuccess, TFail, TError, TReturn>(
  onSucess: SuccessHandler<TSuccess, TReturn>,
  onFail: FailHandler<TFail, TReturn>,
  onError: ErrorHandler<TError, TReturn>,
) => (jsend: JSend<TSuccess, TFail, TError>): TReturn => {
  switch (jsend.status) {
    case "error":
      return onError(jsend);
    case "fail":
      return onFail(jsend);
    case "success":
      return onSucess(jsend);
    // default:
    // TODO: return assertNever(jsend)
  }
};
