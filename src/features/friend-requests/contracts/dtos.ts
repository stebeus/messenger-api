import * as z from 'zod';

import { id } from '#contracts/entity.ts';
import { UserQuery } from '#features/users/contracts/dtos.ts';
import { User } from '#features/users/contracts/entity.ts';

import { FriendRequest } from './entity.ts';

export const FriendRequestParams = z.object({
	recipientId: id,
});

export const directions = ['incoming', 'outgoing'] as const;

export const FriendRequestQuery = z
	.strictObject({
		...UserQuery.shape,
		direction: z.enum(directions),
	})
	.partial();

export const ListFriendRequestsResponse = z.array(
	z.object({
		...FriendRequest.shape,
		requester: z.nullable(User),
		recipient: z.nullable(User),
	}),
);

export type FriendRequestParams = z.infer<typeof FriendRequestParams>;

export type FriendRequestQuery = z.infer<typeof FriendRequestQuery>;

export type ListFriendRequestsResponse = z.infer<typeof ListFriendRequestsResponse>;
