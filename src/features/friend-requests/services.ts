import type { UserPair } from '#features/users/contracts/entity.ts';
import type { FriendRequestArgs } from './types.ts';

import { type DatabaseContext, db } from '#db/index.ts';
import { dmService } from '#features/conversations/dms/services.ts';
import { friendshipService } from '#features/friendships/services.ts';
import { userService } from '#features/users/services.ts';
import { ConflictError, NotFoundError } from '#utils/errors.ts';

import { friendRequestRepository } from './repository.ts';

const send = async ({ requesterId, recipientId }: FriendRequestArgs) => {
	const { id } = await userService.getOne({ userId: recipientId });
	const friendship = await friendshipService.findOne({ user1Id: requesterId, user2Id: id });

	if (friendship != null) throw new ConflictError({ message: 'Friendship already exists' });

	return await friendRequestRepository.create({ requesterId, recipientId: id });
};

const getOne = async ({ user1Id, user2Id }: DatabaseContext<UserPair>) => {
	const friendRequest = await friendRequestRepository.findOne({ user1Id, user2Id });
	if (friendRequest == null) throw new NotFoundError({ resource: 'friend request' });
	return friendRequest;
};

const accept = async (args: FriendRequestArgs) =>
	db.transaction(async (tx) => {
		const { requesterId, recipientId } = await getOne({
			user1Id: args.recipientId,
			user2Id: args.requesterId,
			tx,
		});

		await dmService.create({ user1Id: requesterId, user2Id: recipientId, tx });
		await friendRequestRepository.destroy({ requesterId, recipientId, tx });

		return await friendshipService.create({ user1Id: requesterId, user2Id: recipientId, tx });
	});

const cancel = async (args: UserPair) => {
	const { requesterId, recipientId } = await getOne(args);
	return await friendRequestRepository.destroy({ requesterId, recipientId });
};

export const friendRequestService = { send, accept, cancel } as const;
