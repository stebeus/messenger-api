import type { UserPair } from '#features/users/contracts/entity.ts';

import { and, eq } from 'drizzle-orm';

import { parseId } from '#db/index.ts';
import { friendships } from '#db/schemas/social.ts';

export const isFriendship = ({ user1Id, user2Id }: UserPair) =>
	and(eq(friendships.user1Id, user1Id), eq(friendships.user2Id, user2Id));

export const orderFriendshipIds = (args: UserPair) => {
	const [user1Id, user2Id] = Object.values(args).map(parseId) as [number, number];

	const minId = Math.min(user1Id, user2Id).toString();
	const maxId = Math.max(user1Id, user2Id).toString();

	return { user1Id: minId, user2Id: maxId } as const;
};
