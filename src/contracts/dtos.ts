import * as z from 'zod';

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

export const HttpErrorResponse = z.object({
	status: z.number(),
	message: z.string(),
});

export const BadRequestErrorResponse = z.object({
	...HttpErrorResponse.shape,
	details: z.object({
		formErrors: z.array(z.string()),
		fieldErrors: z.record(z.string(), z.array(z.string())),
	}),
});

export type Query = z.infer<typeof Query>;

export type HttpErrorResponse = z.infer<typeof HttpErrorResponse>;

export type BadRequestErrorResponse = z.infer<typeof BadRequestErrorResponse>;

export type QueryArgs<Dto = Query> = {
	query: Dto;
};

export type BodyArgs<Dto> = {
	body: Dto;
};
