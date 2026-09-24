import * as z from 'zod';

import { createdAt, id } from '#contracts/entity.ts';

export const FriendRequest = z.object({
	requesterId: id,
	recipientId: id,
	createdAt,
});

export const NewFriendRequest = FriendRequest.omit({ createdAt: true });

export type FriendRequest = z.infer<typeof FriendRequest>;

export type NewFriendRequest = z.infer<typeof NewFriendRequest>;
