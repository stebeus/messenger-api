import type { Friendship } from '#features/friendships/contracts/entity.ts';

import { createTimestamp, defaultId, defaultId2 } from '#utils/test.ts';

type FriendshipOptions = Partial<Friendship>;

export const createFriendship = ({
	user1Id = defaultId,
	user2Id = defaultId2,
	createdAt,
}: FriendshipOptions = {}) =>
	({ user1Id, user2Id, createdAt: createTimestamp(createdAt) }) as const;
