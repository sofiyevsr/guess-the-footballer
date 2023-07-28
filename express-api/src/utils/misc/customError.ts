export class CustomError extends Error {
  public message: string;
  public status: number;
  constructor(message: string = "Error occured", status: number = 500) {
    super(message);
    this.message = message;
    this.status = status;
    Error.captureStackTrace(this, this.constructor);
  }
}
