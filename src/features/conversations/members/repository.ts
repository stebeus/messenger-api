import type { MemberUpdate, NewMember } from './contracts/entity.ts';
import type { MemberArgs, MemberSelection, MembersSelection } from './types.ts';

import {
	CreationError,
	type DatabaseContext,
	DeletionError,
	db,
	orderBy,
	UpdateError,
} from '#db/index.ts';
import { members } from '#db/schemas/conversation.ts';
import { containsName } from '#features/users/helpers.ts';

import { isMember, memberRelations } from './helpers.ts';

const create = async ({ tx = db, ...values }: DatabaseContext<NewMember>) => {
	const [data] = await tx.insert(members).values(values).returning();
	if (data == null) throw new CreationError('member', values);
	return data;
};

const find = async ({
	conversationId,
	query: { q, sort, order },
	tx = db,
}: DatabaseContext<MembersSelection>) =>
	await tx.query.members.findMany({
		where: { conversationId, user: containsName(q) },
		with: memberRelations,
		...orderBy(sort, order),
	});

const findOne = async ({ tx = db, ...values }: DatabaseContext<MemberSelection>) =>
	await tx.query.members.findFirst({ where: values, with: memberRelations });

const update = async ({ role, tx = db, ...values }: DatabaseContext<MemberUpdate>) => {
	const [data] = await tx.update(members).set({ role }).where(isMember(values)).returning();
	if (data == null) throw new UpdateError('member', { ...values, role });
	return data;
};

const purge = async ({ tx = db, ...values }: DatabaseContext<MemberArgs>) => {
	const [data] = await tx.delete(members).where(isMember(values)).returning();
	if (data == null) throw new DeletionError('member', values);
	return data;
};

export const memberRepository = { create, find, findOne, update, purge } as const;
