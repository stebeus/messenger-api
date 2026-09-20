import * as z from 'zod';

import { id } from '#contracts/entities.ts';

export const FriendParams = z.object({
	friendId: id,
});

export const CreateFriendParams = z.object({
	requesterId: id,
});

export type FriendParams = z.infer<typeof FriendParams>;

export type CreateFriendParams = z.infer<typeof CreateFriendParams>;
