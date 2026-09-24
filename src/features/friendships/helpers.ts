import type { UserPair } from '#features/users/contracts/entity.ts';
import type { FriendshipSelectionResult } from './types.ts';

import { and, eq } from 'drizzle-orm';

import { parseId } from '#db/helpers.ts';
import { friendships } from '#db/schemas/social.ts';

export const isFriendship = ({ user1Id, user2Id }: UserPair) =>
	and(eq(friendships.user1Id, user1Id), eq(friendships.user2Id, user2Id));

export const mergeFriend = ({ user1, user2, ...friendship }: FriendshipSelectionResult = {}) =>
	({ ...friendship, friend: user1 ?? user2 }) as const;

export const orderFriendshipId = (args: UserPair) => {
	const [user1Id, user2Id] = Object.values(args).map(parseId);
	if (user1Id == null || user2Id == null) throw new TypeError('Friendship ID is undefined');

	const minId = Math.min(user1Id, user2Id).toString();
	const maxId = Math.max(user1Id, user2Id).toString();

	return { user1Id: minId, user2Id: maxId } as const;
};
