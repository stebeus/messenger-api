import type { UserPair } from '#features/users/contracts/entity.ts';
import type { NewFriendRequest } from './contracts/entity.ts';
import type { FriendRequestArgs, ListFriendRequestArgs } from './types.ts';

import {
	CreationError,
	type DatabaseContext,
	DeletionError,
	db,
	exclude,
	orderBy,
} from '#db/index.ts';
import { friendRequests } from '#db/schemas/social.ts';
import { containsName } from '#features/users/helpers.ts';

import { isFriendRequest } from './helpers.ts';

const create = async ({ tx = db, ...values }: DatabaseContext<NewFriendRequest>) => {
	const [data] = await tx.insert(friendRequests).values(values).returning();
	if (data == null) throw new CreationError('friend request', values);
	return data;
};

const find = async ({
	userId,
	query: { q, direction, sort, order },
	tx = db,
}: DatabaseContext<ListFriendRequestArgs>) => {
	const name = containsName(q);
	const notCurrentUser = exclude(userId);

	const requestDirection = {
		incoming: { recipientId: userId, requester: name },
		outgoing: { requesterId: userId, recipient: name },
	} as const;

	const where =
		direction == null
			? { OR: [requestDirection.incoming, requestDirection.outgoing] }
			: requestDirection[direction];

	return await tx.query.friendRequests.findMany({
		where,
		with: { requester: { where: notCurrentUser }, recipient: { where: notCurrentUser } },
		...orderBy(sort, order),
	});
};

const findOne = async ({ user1Id, user2Id, tx = db }: DatabaseContext<UserPair>) =>
	await tx.query.friendRequests.findFirst({
		where: {
			OR: [
				{ requesterId: user1Id, recipientId: user2Id },
				{ requesterId: user2Id, recipientId: user1Id },
			],
		},
		with: { requester: true, recipient: true },
	});

const destroy = async ({ tx = db, ...values }: DatabaseContext<FriendRequestArgs>) => {
	const [data] = await tx.delete(friendRequests).where(isFriendRequest(values)).returning();
	if (data == null) throw new DeletionError('friend request', values);
	return data;
};

export const friendRequestRepository = { create, find, findOne, destroy } as const;
