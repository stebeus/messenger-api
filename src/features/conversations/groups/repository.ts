import type { GroupUpdate, NewGroup } from './contracts/entity.ts';
import type { GroupSelection, GroupsSelection } from './types.ts';

import { eq } from 'drizzle-orm';

import { CreationError, type DatabaseContext, db, orderBy, UpdateError } from '#db/index.ts';
import { groups } from '#db/schemas/conversation.ts';

import {
	containsGroupName,
	filterGroupMember,
	groupRelations,
	groupSearchRelations,
} from './helpers.ts';

const create = async ({ tx = db, ...values }: DatabaseContext<NewGroup>) => {
	const [data] = await tx.insert(groups).values(values).returning();
	if (data == null) throw new CreationError('group', values);
	return data;
};

const find = async ({
	userId,
	query: { q, sort, order },
	tx = db,
}: DatabaseContext<GroupsSelection>) =>
	await tx.query.groups.findMany({
		where: {
			...containsGroupName(q),
			NOT: { OR: [filterGroupMember(userId), { bans: { userId } }] },
		},
		with: groupSearchRelations,
		...orderBy(sort, order),
	});

const findOne = async ({ tx = db, ...values }: DatabaseContext<GroupSelection>) =>
	await tx.query.groups.findFirst({ where: values, with: groupRelations });

const findByMembership = async ({
	userId,
	query: { q, sort, order },
	tx = db,
}: DatabaseContext<GroupsSelection>) =>
	await tx.query.groups.findMany({
		where: { ...filterGroupMember(userId), ...containsGroupName(q) },
		with: groupRelations,
		...orderBy(sort, order),
	});

const update = async ({ conversationId, tx = db, ...values }: DatabaseContext<GroupUpdate>) => {
	const [data] = await tx
		.update(groups)
		.set(values)
		.where(eq(groups.conversationId, conversationId))
		.returning();

	if (data == null) throw new UpdateError('group', { ...values, conversationId });

	return data;
};

export const groupRepository = { create, find, findOne, findByMembership, update } as const;
