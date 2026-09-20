import type { Id } from '#contracts/entities.ts';

export const contains = (query?: string) =>
	query == null ? undefined : ({ like: `%${query}%` } as const);

export const orderBy = (sort = 'createdAt', order = 'asc') =>
	({ orderBy: { [sort]: order } }) as const;

export const parseId = (id: Id) => {
	const parsedId = Number.parseInt(id, 10);
	if (Number.isNaN(parsedId)) throw new Error('Parsed ID is NaN');
	return parsedId;
};
