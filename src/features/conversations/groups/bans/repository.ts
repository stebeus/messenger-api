import type { GroupMember } from '#features/conversations/members/types.ts';
import type { BanUpdate, NewBan } from './contracts/entity.ts';
import type { BanSelection, BansSelection } from './types.ts';

import {
	CreationError,
	type DatabaseContext,
	DeletionError,
	db,
	orderBy,
	UpdateError,
} from '#db/index.ts';
import { bans } from '#db/schemas/conversation.ts';
import { containsName } from '#features/users/helpers.ts';

import { banRelations, isBan } from './helpers.ts';

const create = async ({ tx = db, ...values }: DatabaseContext<NewBan>) => {
	const [data] = await tx.insert(bans).values(values).returning();
	if (data == null) throw new CreationError('ban', values);
	return data;
};

const find = async ({
	groupId,
	query: { q, sort, order },
	tx = db,
}: DatabaseContext<BansSelection>) =>
	await tx.query.bans.findMany({
		where: { groupId, user: containsName(q) },
		with: banRelations,
		...orderBy(sort, order),
	});

const findOne = async ({ tx = db, ...values }: DatabaseContext<BanSelection>) =>
	await tx.query.bans.findFirst({ where: values, with: banRelations });

const update = async ({ tx = db, userId, groupId, ...values }: DatabaseContext<BanUpdate>) => {
	const [data] = await tx.update(bans).set(values).where(isBan({ userId, groupId })).returning();
	if (data == null) throw new UpdateError('ban', { ...values, userId, groupId });
	return data;
};

const destroy = async ({ tx = db, ...values }: DatabaseContext<GroupMember>) => {
	const [data] = await tx.delete(bans).where(isBan(values)).returning();
	if (data == null) throw new DeletionError('ban', values);
	return data;
};

export const banRepository = { create, find, findOne, update, destroy } as const;
