import * as z from 'zod';

import { id, Query } from '#contracts/index.ts';

export const FriendRequestParams = z.object({
	recipientId: id,
});

export const directions = ['incoming', 'outgoing'] as const;

export const FriendRequestQuery = z
	.object({
		...Query.shape,
		direction: z.enum(directions).default('incoming'),
	})
	.partial();

export type FriendRequestParams = z.infer<typeof FriendRequestParams>;

export type FriendRequestQuery = z.infer<typeof FriendRequestQuery>;
