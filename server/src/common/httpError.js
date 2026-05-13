export class HttpError extends Error {
	constructor(status, message) {
		super(message);
		this.name = "HttpError";
		this.status = status;
	}
}

export function createHttpError(status, message) {
	return new HttpError(status, message);
}

export function isHttpError(err) {
	return err instanceof HttpError;
}
