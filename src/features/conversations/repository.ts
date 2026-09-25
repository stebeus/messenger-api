import type { IdArgs } from '#contracts/entity.ts';
import type { NewConversation } from './contracts/entity.ts';
import type { ParticipatedConversation } from './types.ts';

import { eq } from 'drizzle-orm';

import { CreationError, type DatabaseContext, DeletionError, db } from '#db/index.ts';
import { conversations } from '#db/schemas/conversation.ts';

import { conversationColumns, conversationRelations, filterMember } from './helpers.ts';

const create = async ({ tx = db, ...values }: DatabaseContext<NewConversation>) => {
	const [data] = await tx.insert(conversations).values(values).returning();
	if (data == null) throw new CreationError('conversation', values);
	return data;
};

const findOne = async ({ userId, tx = db, ...values }: DatabaseContext<ParticipatedConversation>) =>
	await tx.query.conversations.findFirst({
		where: { ...filterMember(userId), ...values },
		with: conversationRelations,
		columns: conversationColumns,
	});

const destroy = async ({ id, tx = db }: DatabaseContext<IdArgs>) => {
	const [data] = await tx.delete(conversations).where(eq(conversations.id, id)).returning();
	if (data == null) throw new DeletionError('conversation', { id });
	return data;
};

export const conversationRepository = { create, findOne, destroy } as const;
