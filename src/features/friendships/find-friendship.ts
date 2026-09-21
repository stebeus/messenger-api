import type { DatabaseContext } from '#db/types.ts';
import type { UserPair } from '#features/users/contracts/entity.ts';

import { orderFriendshipId } from './helpers.ts';
import { friendshipRepository } from './repository.ts';

export const findFriendship = async ({ user1Id, user2Id, tx }: DatabaseContext<UserPair>) => {
	const friendshipId = orderFriendshipId({ user1Id, user2Id });
	return await friendshipRepository.findOne({ ...friendshipId, tx });
};
