import * as z from 'zod';

import { avatar, id, Query, sorts } from '#contracts/index.ts';

import { NewUser, UserUpdate } from './entity.ts';

export const UserParams = z.object({
	userId: id,
});

export const userSorts = [...sorts, 'name'] as const;

export const UserQuery = z
	.object({
		...Query.shape,
		sort: z.enum(userSorts).default('createdAt'),
	})
	.partial();

export const CreateUserBody = z.object({
	...NewUser.shape,
	avatar,
});

export const UpdateUserBody = z.object({
	...UserUpdate.shape,
	avatar,
});

export type UserParams = z.infer<typeof UserParams>;

export type UserQuery = z.infer<typeof UserQuery>;

export type CreateUserBody = z.infer<typeof CreateUserBody>;

export type UpdateUserBody = z.infer<typeof UpdateUserBody>;
