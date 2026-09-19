import * as z from 'zod';

import { Base, base, id, timestamps } from '#contracts/entities.ts';
import { formatMaxLength, formatMinLength } from '#utils/formatters.ts';

import { bio, displayName, password, username } from './constants.ts';

export const User = z.object({
	...Base.shape,
	username: z
		.string()
		.trim()
		.min(username.minLength, formatMinLength(username.minLength, username.fieldName))
		.max(username.maxLength, formatMaxLength(username.maxLength, username.fieldName))
		.regex(username.regex, 'Username must only contain alphanumeric characters'),
	displayName: z
		.string()
		.trim()
		.max(displayName.maxLength, formatMaxLength(displayName.maxLength, displayName.fieldName))
		.nullish(),
	bio: z
		.string()
		.trim()
		.max(bio.maxLength, formatMaxLength(bio.maxLength, bio.fieldName))
		.nullish(),
	avatar: z.httpUrl().normalize().nullish(),
});

const Credentials = z.object({
	...User.shape,
	password: z
		.string()
		.trim()
		.min(password.minLength, formatMinLength(password.minLength, password.fieldName))
		.max(password.maxLength, formatMaxLength(password.maxLength, password.fieldName)),
});

export const NewUser = Credentials.omit(base);

export const UserUpdate = Credentials.omit(timestamps).partial().required({ id: true });

export const UserPair = z.object({
	user1Id: id,
	user2Id: id,
});

export type User = z.infer<typeof User>;

export type NewUser = z.input<typeof NewUser>;

export type UserUpdate = z.infer<typeof UserUpdate>;

export type UserPair = z.infer<typeof UserPair>;
