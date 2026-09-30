import type { ContentfulStatusCode } from 'hono/utils/http-status';

import { STATUS_CODES } from 'node:http';

import { HTTPException } from 'hono/http-exception';

import { capitalize } from './formatters.ts';

type HttpErrorOptions = Partial<{
	message: string;
	details: unknown;
	res: Response;
}>;

type HttpResourceErrorOptions = HttpErrorOptions & {
	resource?: string;
};

export type HttpErrorMessageFormatOptions = Pick<HttpResourceErrorOptions, 'resource' | 'message'>;

const formatHttpErrorMessage = (
	template: string,
	{ resource, message }: HttpErrorMessageFormatOptions,
) => (resource != null && message == null ? `${capitalize(resource)} ${template}` : message);

export const formatNotFoundErrorMessage = (options: HttpErrorMessageFormatOptions) =>
	formatHttpErrorMessage('not found', options);

export const formatConflictErrorMessage = (options: HttpErrorMessageFormatOptions) =>
	formatHttpErrorMessage('already exists', options);

export const formatContentTooLargeErrorMessage = (options: HttpErrorMessageFormatOptions) =>
	formatHttpErrorMessage('is too large', options);

export class HttpError extends HTTPException {
	static isHttpError(error: unknown) {
		return error instanceof HTTPException;
	}

	readonly message;
	readonly details;

	constructor(
		status: ContentfulStatusCode = 500,
		{ message = STATUS_CODES[status], details, res }: HttpErrorOptions = {},
	) {
		super(status, { message, res });
		this.message = message ?? 'Internal Server Error';
		this.details = details;
	}
}

export class BadRequestError extends HttpError {
	constructor(options?: HttpErrorOptions) {
		super(400, options);
	}
}

export class UnauthorizedError extends HttpError {
	constructor(options?: HttpErrorOptions) {
		super(401, options);
	}
}

export class ForbiddenError extends HttpError {
	constructor(options?: HttpErrorOptions) {
		super(403, options);
	}
}

export class NotFoundError extends HttpError {
	constructor({ resource, message, ...options }: HttpResourceErrorOptions = {}) {
		super(404, { ...options, message: formatNotFoundErrorMessage({ resource, message }) });
	}
}

export class ConflictError extends HttpError {
	constructor({ resource, message, ...options }: HttpResourceErrorOptions = {}) {
		super(409, {
			...options,
			message: formatConflictErrorMessage({ resource, message }),
		});
	}
}

export class ContentTooLargeError extends HttpError {
	constructor({ resource, message, ...options }: HttpResourceErrorOptions = {}) {
		super(413, {
			...options,
			message: formatContentTooLargeErrorMessage({ resource, message }),
		});
	}
}

export class UnprocessableContentError extends HttpError {
	constructor(options?: HttpErrorOptions) {
		super(422, options);
	}
}

export const catchError = (error: unknown): NodeJS.ErrnoException => {
	if (Error.isError(error)) return error;

	let serialized = '[Non-serializable value]';

	try {
		serialized = JSON.stringify(error, undefined, '\t');
	} catch {}

	return new Error(`Unexpected throw: ${serialized}`);
};
