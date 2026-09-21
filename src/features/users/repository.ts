import type { ListUserArgs, UserSelection } from './types.ts';

import { type DatabaseContext, db, orderBy } from '#db/index.ts';

import { containsName, userRelations } from './helpers.ts';

const find = async ({
	userId,
	query: { q, sort, order },
	tx = db,
}: DatabaseContext<ListUserArgs>) =>
	await tx.query.users.findMany({
		where: { ...containsName(q), NOT: { id: userId } },
		with: userRelations,
		...orderBy(sort, order),
	});

const findOne = async ({ tx = db, ...values }: DatabaseContext<UserSelection>) =>
	await tx.query.users.findFirst({ where: values, with: userRelations });

export const userRepository = { find, findOne } as const;
