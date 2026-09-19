import * as z from 'zod';

import { id } from '#contracts/entities.ts';

export const FriendParams = z.object({
	friendId: id,
});

export type FriendParams = z.infer<typeof FriendParams>;
