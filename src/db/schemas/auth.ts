import type { User } from '#features/users/contracts/entity.ts';

import { boolean, index, snakeCase, text } from 'drizzle-orm/pg-core';

import { base, reference, type SatisfiesContract } from './helpers.ts';

export const authSchema = snakeCase.schema('auth');

export const users = authSchema.table('users', (t) => ({
	...base,
	username: t.text().notNull().unique(),
	displayName: t.text(),
	bio: t.text(),
	avatar: t.text(),

	// ! Unused columns from Better Auth
	name: text().notNull(),
	email: text().notNull().unique(),
	emailVerified: boolean().default(false).notNull(),
}));

export const sessions = authSchema.table(
	'sessions',
	(t) => ({
		...base,
		expiresAt: t.timestamp().notNull(),
		token: t.text().notNull().unique(),
		ipAddress: t.text(),
		userAgent: t.text(),
		userId: reference(() => users.id, { onDelete: 'cascade' }).notNull(),
	}),
	(t) => [index('sessions_userId_idx').on(t.userId)],
);

export const accounts = authSchema.table(
	'accounts',
	(t) => ({
		...base,
		accountId: t.text().notNull(),
		providerId: t.text().notNull(),
		userId: reference(() => users.id, { onDelete: 'cascade' }).notNull(),
		accessToken: t.text(),
		refreshToken: t.text(),
		idToken: t.text(),
		accessTokenExpiresAt: t.timestamp(),
		refreshTokenExpiresAt: t.timestamp(),
		scope: t.text(),
		password: t.text(),
	}),
	(t) => [index('accounts_userId_idx').on(t.userId)],
);

export const verifications = authSchema.table(
	'verifications',
	(t) => ({
		...base,
		identifier: t.text().notNull(),
		value: t.text().notNull(),
		expiresAt: t.timestamp().notNull(),
	}),
	(t) => [index('verifications_identifier_idx').on(t.identifier)],
);

type _UserContractCheck = SatisfiesContract<typeof users.$inferSelect, User>;
