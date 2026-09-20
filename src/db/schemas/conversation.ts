import type { Ban } from '#features/conversations/groups/bans/contracts/entity.ts';
import type { Message } from '#features/conversations/messages/contracts/entity.ts';

import { snakeCase, unique } from 'drizzle-orm/pg-core';

import { Conversation, conversationTypes } from '#features/conversations/contracts/entity.ts';
import { Group, visibilities } from '#features/conversations/groups/contracts/entity.ts';
import { Member, roles } from '#features/conversations/members/contracts/entity.ts';

import { users } from './auth.ts';
import {
	base,
	createdAt,
	id,
	reference,
	type SatisfiesContract,
	timestamps,
	withTimezone,
} from './helpers.ts';

const { type } = Conversation.shape;
const { visibility } = Group.shape;
const { role } = Member.shape;

export const messagingSchema = snakeCase.schema('messaging');

export const conversations = messagingSchema.table('conversations', (t) => ({
	id,
	type: t.text({ enum: conversationTypes }).default(type.def.defaultValue).notNull(),
	createdAt,
}));

export const groups = messagingSchema.table('groups', (t) => ({
	...timestamps,
	conversationId: reference(() => users.id, { onDelete: 'cascade' }).notNull(),
	ownerId: reference(() => conversations.id, { onDelete: 'cascade' }).notNull(),
	name: t.text().notNull(),
	description: t.text(),
	avatar: t.text(),
	visibility: t.text({ enum: visibilities }).default(visibility.def.defaultValue).notNull(),
}));

export const bans = messagingSchema.table(
	'bans',
	(t) => ({
		...timestamps,
		userId: reference(() => users.id, { onDelete: 'cascade' }).notNull(),
		groupId: reference(() => conversations.id, { onDelete: 'cascade' }).notNull(),
		reason: t.text().notNull(),
		expiresAt: t.timestamp({ withTimezone }),
	}),
	(t) => [unique().on(t.userId, t.groupId)],
);

export const members = messagingSchema.table(
	'members',
	(t) => ({
		...timestamps,
		userId: reference(() => users.id, { onDelete: 'cascade' }).notNull(),
		conversationId: reference(() => conversations.id, { onDelete: 'cascade' }).notNull(),
		role: t.text({ enum: roles }).default(role.def.defaultValue).notNull(),
	}),
	(t) => [unique().on(t.userId, t.conversationId)],
);

export const messages = messagingSchema.table('messages', (t) => ({
	...base,
	senderId: reference(() => users.id, { onDelete: 'cascade' }).notNull(),
	conversationId: reference(() => conversations.id, { onDelete: 'cascade' }).notNull(),
	content: t.text().notNull(),
}));

type _ConversationContractCheck = SatisfiesContract<
	typeof conversations.$inferSelect,
	Conversation
>;

type _GroupContractCheck = SatisfiesContract<typeof groups.$inferSelect, Group>;
type _BanContractCheck = SatisfiesContract<typeof bans.$inferSelect, Ban>;
type _MemberContractCheck = SatisfiesContract<typeof members.$inferSelect, Member>;
type _MessageContractCheck = SatisfiesContract<typeof messages.$inferSelect, Message>;
