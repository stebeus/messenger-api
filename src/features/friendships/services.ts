import type { UserPair } from '#features/users/contracts/entity.ts';
import type { UsersSelection } from '#features/users/types.ts';

import { type DatabaseContext, db } from '#db/index.ts';
import { dmService } from '#features/conversations/dms/services.ts';
import { NotFoundError } from '#utils/errors.ts';

import { mergeFriend, orderFriendshipId } from './helpers.ts';
import { friendshipRepository } from './repository.ts';

const create = async ({ user1Id, user2Id, tx }: DatabaseContext<UserPair>) => {
	const friendshipId = orderFriendshipId({ user1Id, user2Id });
	return await friendshipRepository.create({ ...friendshipId, tx });
};

const find = async ({ userId, query }: UsersSelection) => {
	const friendships = await friendshipRepository.find({ userId, query });
	return friendships.map(mergeFriend);
};

const findOne = async ({ user1Id, user2Id, tx }: DatabaseContext<UserPair>) => {
	const friendshipId = orderFriendshipId({ user1Id, user2Id });
	return await friendshipRepository.findOne({ ...friendshipId, tx });
};

const getOne = async ({ user1Id, user2Id }: DatabaseContext<UserPair>) => {
	const friendship = await findOne({ user1Id, user2Id });
	if (friendship == null) throw new NotFoundError({ resource: 'friendship' });
	return friendship;
};

const unfriend = async ({ user1Id, user2Id }: UserPair) =>
	db.transaction(async (tx) => {
		const friendship = await getOne({ user1Id, user2Id, tx });

		await dmService.destroyByPair({ user1Id: friendship.user1Id, user2Id: friendship.user2Id, tx });

		return await friendshipRepository.destroy({
			user1Id: friendship.user1Id,
			user2Id: friendship.user2Id,
			tx,
		});
	});

export const friendshipService = { create, find, findOne, getOne, unfriend } as const;
