import { STATUS_CODES } from 'node:http';

import * as z from 'zod';

import {
	formatConflictErrorMessage,
	formatContentTooLargeErrorMessage,
	formatNotFoundErrorMessage,
	type HttpErrorMessageFormatOptions,
} from '#utils/errors.ts';

const createHttpErrorResponse = (status = 500, message = STATUS_CODES[status]) =>
	z.object({
		status: z.literal(status),
		message: z.literal(message ?? 'Internal Server Error'),
	});

export const sorts = ['createdAt', 'updatedAt'] as const;

export const orders = ['asc', 'desc'] as const;

export const avatar = z
	.instanceof(File)
	.refine(
		({ type }) => ['image/jpeg', 'image/png', 'image/webp'].includes(type),
		'Invalid image format. Only JPEG, PNG, and WebP are accepted',
	)
	.optional();

export const Query = z
	.strictObject({
		q: z.string(),
		sort: z.enum(sorts).default('createdAt'),
		order: z.enum(orders).default('asc'),
	})
	.partial();

export const BadRequestErrorResponse = z.object({
	...createHttpErrorResponse(400).shape,
	details: z.object({
		formErrors: z.array(z.string()),
		fieldErrors: z.record(z.string(), z.array(z.string())),
	}),
});

export const UnauthorizedErrorResponse = createHttpErrorResponse(401);

export const ForbiddenErrorResponse = createHttpErrorResponse(403);

export const createNotFoundErrorResponse = (options: HttpErrorMessageFormatOptions) =>
	createHttpErrorResponse(404, formatNotFoundErrorMessage(options));

export const createConflictErrorResponse = (options: HttpErrorMessageFormatOptions) =>
	createHttpErrorResponse(409, formatConflictErrorMessage(options));

const createContentTooLargeErrorResponse = (options: HttpErrorMessageFormatOptions) =>
	createHttpErrorResponse(413, formatContentTooLargeErrorMessage(options));

export const AvatarIsTooLargeErrorResponse = createContentTooLargeErrorResponse({
	resource: 'avatar',
});

export const createUnprocessableContentErrorResponse = (message: string) =>
	createHttpErrorResponse(422, message);

export type Query = z.infer<typeof Query>;

export type QueryArgs<Dto = Query> = {
	query: Dto;
};

export type BodyArgs<Dto> = {
	body: Dto;
};
