import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-orm/zod';
import * as z from 'zod';

import { id } from '#contracts/entities.ts';
import { users } from '#db/schemas/auth.ts';
import { formatMaxLength, formatMinLength } from '#utils/formatters.ts';

import { constants } from './constants.ts';

const refinements = {
	username: z
		.string()
		.trim()
		.min(constants.USERNAME_MIN_LENGTH, formatMinLength('username', constants.USERNAME_MIN_LENGTH))
		.max(constants.USERNAME_MAX_LENGTH, formatMaxLength('username', constants.USERNAME_MAX_LENGTH))
		.regex(constants.USERNAME_REGEX, 'Username must only contain alphanumeric characters'),
	displayName: z
		.string()
		.trim()
		.max(
			constants.DISPLAY_NAME_MAX_LENGTH,
			formatMaxLength('display name', constants.DISPLAY_NAME_MAX_LENGTH),
		)
		.nullable(),
	avatar: z.httpUrl().normalize().nullable(),
} as const;

const unusedFields = { name: true, email: true, emailVerified: true } as const;

const userInsertSchema = createInsertSchema(users, refinements).omit(unusedFields);

const userUpdateSchema = createUpdateSchema(users, refinements).omit(unusedFields);

const password = z
	.string()
	.trim()
	.min(constants.PASSWORD_MIN_LENGTH, formatMinLength('password', constants.PASSWORD_MIN_LENGTH))
	.max(constants.PASSWORD_MAX_LENGTH, formatMinLength('password', constants.PASSWORD_MAX_LENGTH));

export const User = createSelectSchema(users, refinements).omit(unusedFields);

export const NewUser = z.object({
	...userInsertSchema.shape,
	password,
});

export const UserUpdate = z
	.object({
		...userUpdateSchema.shape,
		id,
		password,
	})
	.partial()
	.required({ id: true });

export type User = z.infer<typeof User>;

export type NewUser = z.infer<typeof NewUser>;

export type UserUpdate = z.infer<typeof UserUpdate>;
