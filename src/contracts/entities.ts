import * as z from 'zod';

export const id = z.string().regex(/^[1-9]\d*$/);

export type Id = z.infer<typeof id>;

export type IdArgs = {
	id: Id;
};
