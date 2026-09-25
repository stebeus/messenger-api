import type { UserPair } from '#features/users/contracts/entity.ts';

import { type DatabaseContext, db, orderBy } from '#db/index.ts';
import {
	conversationColumns,
	conversationRelations,
	filterMember,
} from '#features/conversations/helpers.ts';
import { containsName, type UsersSelection } from '#features/users/index.ts';

const type = 'direct';

const find = async ({
	userId,
	query: { q, sort, order },
	tx = db,
}: DatabaseContext<UsersSelection>) =>
	await tx.query.conversations.findMany({
		where: { members: { userId, user: containsName(q) }, type },
		with: conversationRelations,
		columns: conversationColumns,
		...orderBy(sort, order),
	});

const findOneByPair = async ({ user1Id, user2Id, tx = db }: DatabaseContext<UserPair>) =>
	await tx.query.conversations.findFirst({
		where: { AND: [filterMember(user1Id), filterMember(user2Id)], type },
		columns: conversationColumns,
	});

export const dmRepository = { find, findOneByPair } as const;
