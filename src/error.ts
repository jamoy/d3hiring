export default class ApiError extends Error {
  private statusCode: number;
  private code: string;
  private extra: any;
  private msg: string;

  constructor(message: string, statusCode: number, code: string, extra?: any) {
    super(message);
    this.statusCode = statusCode;
    this.msg = message;
    this.code = code;
    this.extra = extra;
  }
}
