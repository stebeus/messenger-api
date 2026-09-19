import type { ConversationMember } from '#features/conversations/types.ts';
import type { UserPair } from '#features/users/contracts/entity.ts';

import { type DatabaseContext, db, orderBy } from '#db/index.ts';
import { conversationRelations, memberOf } from '#features/conversations/helpers.ts';
import { containsName, type ListUserArgs } from '#features/users/index.ts';

const type = 'direct';

const find = async ({
	userId,
	query: { q, sort, order },
	tx = db,
}: DatabaseContext<ListUserArgs>) =>
	await tx.query.conversations.findMany({
		where: { members: { userId, user: containsName(q) }, type },
		with: conversationRelations,
		...orderBy(sort, order),
	});

const findOne = async ({ id, userId, tx = db }: DatabaseContext<ConversationMember>) =>
	await tx.query.conversations.findFirst({
		where: { ...memberOf(userId), id, type },
		with: conversationRelations,
	});

const findOneByPair = async ({ user1Id, user2Id, tx = db }: DatabaseContext<UserPair>) =>
	await tx.query.conversations.findFirst({
		where: { AND: [memberOf(user1Id), memberOf(user2Id)], type },
	});

export const dmRepository = { find, findOne, findOneByPair } as const;
