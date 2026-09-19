import * as z from 'zod';

export const sorts = ['createdAt', 'updatedAt'] as const;

export const orders = ['asc', 'desc'] as const;

export const Query = z
	.object({
		q: z.string(),
		sort: z.enum(sorts).default('createdAt'),
		order: z.enum(orders).default('asc'),
	})
	.partial();

export type Query = z.infer<typeof Query>;

export type QueryDto<Dto = Query> = {
	query: Dto;
};

export type BodyDto<Dto> = {
	body: Dto;
};
