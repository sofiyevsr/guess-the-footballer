import { StatusCode } from "hono/utils/http-status";

export class ApiError extends Error {
	public status: StatusCode;
	constructor(message: string, status: StatusCode = 500) {
		super(message);
		this.status = status;
		Error.captureStackTrace(this, this.constructor);
	}
}
