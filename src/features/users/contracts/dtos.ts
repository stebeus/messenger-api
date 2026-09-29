import * as z from 'zod';

import { avatar, id, Query, sorts } from '#contracts/index.ts';
import { Group } from '#features/conversations/groups/contracts/entity.ts';
import { Member } from '#features/conversations/members/contracts/entity.ts';

import { NewUser, User, UserUpdate } from './entity.ts';

export const UserParams = z.object({
	userId: id,
});

export const userSorts = [...sorts, 'name'] as const;

export const UserQuery = z
	.strictObject({
		...Query.shape,
		sort: z.enum(userSorts).default('createdAt'),
	})
	.partial();

export const CreateUserBodyRequest = z.object({
	...NewUser.shape,
	avatar,
});

export const UpdateUserBodyRequest = z.object({
	...UserUpdate.shape,
	avatar,
});

export const GetUserResponse = z.object({
	...User.shape,
	groups: z.array(Group),
	memberships: z.array(Member),
});

export const ListUserResponse = z.array(GetUserResponse);

export type UserParams = z.infer<typeof UserParams>;

export type UserQuery = z.infer<typeof UserQuery>;

export type CreateUserBodyRequest = z.infer<typeof CreateUserBodyRequest>;

export type UpdateUserBodyRequest = z.infer<typeof UpdateUserBodyRequest>;

export type GetUserResponse = z.infer<typeof GetUserResponse>;

export type ListUserResponse = z.infer<typeof ListUserResponse>;
