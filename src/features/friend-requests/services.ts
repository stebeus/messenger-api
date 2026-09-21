import type { UserPair } from '#features/users/contracts/entity.ts';
import type { FriendRequestArgs } from './types.ts';

import { type DatabaseContext, db } from '#db/index.ts';
import { dmRepository, dmService } from '#features/conversations/dms/index.ts';
import { friendshipService } from '#features/friendships/services.ts';
import { userService } from '#features/users/services.ts';
import { ConflictError, NotFoundError, UnprocessableContentError } from '#utils/errors.ts';

import { friendRequestRepository } from './repository.ts';

const send = async ({ requesterId, recipientId }: FriendRequestArgs) => {
	if (requesterId === recipientId) {
		throw new UnprocessableContentError({ message: 'Cannot send a friend request to yourself' });
	}

	const { id } = await userService.getOne({ userId: recipientId });

	const friendRequest = await friendRequestRepository.findOne({
		user1Id: requesterId,
		user2Id: id,
	});

	if (friendRequest != null) throw new ConflictError({ message: 'Friend request already exists' });

	const friendship = await friendshipService.findOne({ user1Id: requesterId, user2Id: id });
	if (friendship != null) throw new ConflictError({ message: 'Friendship already exists' });

	return await friendRequestRepository.create({ requesterId, recipientId: id });
};

const getOne = async ({ user1Id, user2Id }: DatabaseContext<UserPair>) => {
	const friendRequest = await friendRequestRepository.findOne({ user1Id, user2Id });
	if (friendRequest == null) throw new NotFoundError({ resource: 'friend request' });
	return friendRequest;
};

const accept = async ({ requesterId, recipientId }: FriendRequestArgs) =>
	db.transaction(async (tx) => {
		const friendRequest = await getOne({ user1Id: recipientId, user2Id: requesterId, tx });
		const dm = await dmRepository.findOneByPair({ user1Id: requesterId, user2Id: recipientId, tx });

		if (dm == null) {
			await dmService.create({
				user1Id: friendRequest.requesterId,
				user2Id: friendRequest.recipientId,
				tx,
			});
		}

		await friendRequestRepository.destroy({ requesterId, recipientId, tx });

		return await friendshipService.create({
			user1Id: friendRequest.requesterId,
			user2Id: friendRequest.recipientId,
			tx,
		});
	});

const cancel = async ({ user1Id, user2Id }: UserPair) => {
	const { requesterId, recipientId } = await getOne({ user1Id, user2Id });
	return await friendRequestRepository.destroy({ requesterId, recipientId });
};

export const friendRequestService = { send, accept, cancel } as const;
