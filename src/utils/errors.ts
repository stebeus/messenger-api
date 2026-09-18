import type { ContentfulStatusCode } from 'hono/utils/http-status';

import { STATUS_CODES } from 'node:http';

import { HTTPException } from 'hono/http-exception';

type HttpErrorOptions = Partial<{
	res: Response;
	message: string;
	cause: unknown;
}>;

export class HttpError extends HTTPException {
	static isHttpError(value: unknown) {
		return value instanceof HTTPException;
	}

	readonly message;
	readonly cause;

	constructor(
		status: ContentfulStatusCode = 500,
		{ res, message = STATUS_CODES[status], cause }: HttpErrorOptions = {},
	) {
		super(status, { res, message, cause });
		this.message = message ?? 'Internal Server Error';
		this.cause = cause;
	}
}

export const catchError = (value: unknown): NodeJS.ErrnoException => {
	if (Error.isError(value)) return value;

	let serialized = '[Non-serializable value]';

	try {
		serialized = JSON.stringify(value, undefined, '\t');
	} catch {}

	return new Error(`Unexpected throw: ${serialized}`);
};
