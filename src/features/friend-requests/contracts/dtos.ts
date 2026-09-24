import * as z from 'zod';

import { id } from '#contracts/entity.ts';
import { UserQuery } from '#features/users/contracts/dtos.ts';

export const FriendRequestParams = z.object({
	recipientId: id,
});

export const directions = ['incoming', 'outgoing'] as const;

export const FriendRequestQuery = z
	.object({
		...UserQuery.shape,
		direction: z.enum(directions),
	})
	.partial();

export type FriendRequestParams = z.infer<typeof FriendRequestParams>;

export type FriendRequestQuery = z.infer<typeof FriendRequestQuery>;
