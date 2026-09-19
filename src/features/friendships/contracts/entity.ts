import * as z from 'zod';

import { createdAt } from '#contracts/entities.ts';
import { UserPair } from '#features/users/contracts/entity.ts';

export const Friendship = z.object({
	...UserPair.shape,
	createdAt,
});

export const NewFriendship = Friendship.omit({ createdAt: true });

export type Friendship = z.infer<typeof Friendship>;

export type NewFriendship = z.infer<typeof NewFriendship>;
