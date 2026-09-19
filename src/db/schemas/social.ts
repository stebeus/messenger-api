import type { FriendRequest } from '#features/friend-requests/contracts/entity.ts';
import type { Friendship } from '#features/friendships/contracts/entity.ts';

import { lt, ne } from 'drizzle-orm';
import { check, snakeCase, unique, uniqueIndex } from 'drizzle-orm/pg-core';

import { users } from './auth.ts';
import {
	castToBigInt,
	createdAt,
	greatest,
	least,
	reference,
	type SatisfiesContract,
} from './helpers.ts';

export const socialSchema = snakeCase.schema('social');

export const friendRequests = socialSchema.table(
	'friend_requests',
	{
		requesterId: reference(() => users.id, { onDelete: 'cascade' }).notNull(),
		recipientId: reference(() => users.id, { onDelete: 'cascade' }).notNull(),
		createdAt,
	},
	(t) => [
		check('no_self_friend_request', ne(t.requesterId, t.recipientId)),
		uniqueIndex('friend_request_idx').on(
			least(castToBigInt(t.requesterId), castToBigInt(t.recipientId)),
			greatest(castToBigInt(t.requesterId), castToBigInt(t.recipientId)),
		),
	],
);

export const friendships = socialSchema.table(
	'friendships',
	{
		user1Id: reference(() => users.id, { onDelete: 'cascade' }).notNull(),
		user2Id: reference(() => users.id, { onDelete: 'cascade' }).notNull(),
		createdAt,
	},
	(t) => [
		check('no_self_friendship', ne(t.user1Id, t.user2Id)),
		check('friendship_id_order', lt(castToBigInt(t.user1Id), castToBigInt(t.user2Id))),
		unique().on(t.user1Id, t.user2Id),
	],
);

type _FriendRequestContractCheck = SatisfiesContract<
	typeof friendRequests.$inferSelect,
	FriendRequest
>;

type _FriendshipContractCheck = SatisfiesContract<typeof friendships.$inferSelect, Friendship>;
