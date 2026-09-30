import * as z from 'zod';

import { id } from '#contracts/entity.ts';
import { User } from '#features/users/contracts/entity.ts';

import { Friendship } from './entity.ts';

export const FriendParams = z.object({
	friendId: id,
});

export const CreateFriendParams = z.object({
	requesterId: id,
});

export const ListFriendsResponse = z.array(
	z.object({
		...Friendship.shape,
		friend: User,
	}),
);

export type FriendParams = z.infer<typeof FriendParams>;

export type CreateFriendParams = z.infer<typeof CreateFriendParams>;

export type ListFriendsResponse = z.infer<typeof ListFriendsResponse>;
