import type { UserPair } from '#features/users/contracts/entity.ts';
import type { NewFriendship } from './contracts/entity.ts';
import type { FriendshipSelection } from './types.ts';

import { CreationError, type DatabaseContext, DeletionError, db, orderBy } from '#db/index.ts';
import { friendships } from '#db/schemas/social.ts';
import { containsName, createUserFilter, type ListUserArgs } from '#features/users/index.ts';

import { isFriendship } from './helpers.ts';

const create = async ({ tx = db, ...values }: DatabaseContext<NewFriendship>) => {
	const [data] = await tx.insert(friendships).values(values).returning();
	if (data == null) throw new CreationError('friendship', values);
	return data;
};

const find = async ({
	userId,
	query: { q, sort, order },
	tx = db,
}: DatabaseContext<ListUserArgs>) => {
	const displayName = containsName(q);
	const userFilter = createUserFilter(userId);

	return await tx.query.friendships.findMany({
		where: {
			OR: [
				{ user1Id: userId, user2: displayName },
				{ user2Id: userId, user1: displayName },
			],
		},
		with: { user1: userFilter, user2: userFilter },
		...orderBy(sort, order),
	});
};

const findOne = async ({ tx = db, ...values }: DatabaseContext<FriendshipSelection>) =>
	await tx.query.friendships.findFirst({ where: values, with: { user1: true, user2: true } });

const destroy = async ({ tx = db, ...values }: DatabaseContext<UserPair>) => {
	const [data] = await tx.delete(friendships).where(isFriendship(values)).returning();
	if (data == null) throw new DeletionError('friendship', values);
	return data;
};

export const friendshipRepository = { create, find, findOne, destroy } as const;
