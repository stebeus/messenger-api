import { snakeCase, unique } from 'drizzle-orm/pg-core';

import { users } from './auth.ts';
import { base, createdAt, id, reference, timestamps, withTimezone } from './helpers.ts';

export const messagingSchema = snakeCase.schema('messaging');

export const conversations = messagingSchema.table('conversations', (t) => ({
	id,
	type: t
		.text({ enum: ['direct', 'group'] })
		.default('direct')
		.notNull(),
	createdAt,
}));

export const groups = messagingSchema.table('groups', (t) => ({
	...timestamps,
	conversationId: reference(() => users.id, { onDelete: 'cascade' }).notNull(),
	ownerId: reference(() => conversations.id, { onDelete: 'cascade' }).notNull(),
	name: t.text().notNull(),
	description: t.text(),
	avatar: t.text(),
	visibility: t
		.text({ enum: ['private', 'public'] })
		.default('private')
		.notNull(),
}));

export const bans = messagingSchema.table(
	'bans',
	(t) => ({
		...timestamps,
		userId: reference(() => users.id, { onDelete: 'cascade' }).notNull(),
		groupId: reference(() => conversations.id, { onDelete: 'cascade' }).notNull(),
		reason: t.text(),
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
		role: t
			.text({ enum: ['member', 'admin', 'owner'] })
			.default('member')
			.notNull(),
	}),
	(t) => [unique().on(t.userId, t.conversationId)],
);

export const messages = messagingSchema.table('messages', (t) => ({
	...base,
	senderId: reference(() => users.id, { onDelete: 'cascade' }).notNull(),
	conversationId: reference(() => conversations.id, { onDelete: 'cascade' }).notNull(),
	content: t.text().notNull(),
}));
