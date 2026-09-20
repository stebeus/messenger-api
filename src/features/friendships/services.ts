import type { UserPair } from '#features/users/contracts/entity.ts';

import { type DatabaseContext, db } from '#db/index.ts';
import { dmService } from '#features/conversations/dms/services.ts';
import { NotFoundError } from '#utils/errors.ts';

import { orderFriendshipId } from './helpers.ts';
import { friendshipRepository } from './repository.ts';

const create = async ({ tx, ...args }: DatabaseContext<UserPair>) => {
	const friendshipId = orderFriendshipId(args);
	return await friendshipRepository.create({ ...friendshipId, tx });
};

const findOne = async ({ tx, ...args }: DatabaseContext<UserPair>) => {
	const friendshipId = orderFriendshipId(args);
	return await friendshipRepository.findOne({ ...friendshipId, tx });
};

const getOne = async (args: DatabaseContext<UserPair>) => {
	const friendship = await findOne(args);
	if (friendship == null) throw new NotFoundError({ resource: 'friendship' });
	return friendship;
};

const unfriend = async (args: UserPair) =>
	db.transaction(async (tx) => {
		const { user1Id, user2Id } = await getOne({ ...args, tx });
		await dmService.destroyByFriendship({ user1Id, user2Id, tx });
		return await friendshipRepository.destroy({ user1Id, user2Id, tx });
	});

export const friendshipService = { create, findOne, getOne, unfriend } as const;
