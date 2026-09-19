import * as z from 'zod';

import { Base, base, timestamps } from '#contracts/entities.ts';
import { formatMaxLength, formatMinLength } from '#utils/formatters.ts';

import { bio, displayName, password, username } from './constants.ts';

export const User = z.object({
	...Base.shape,
	username: z
		.string()
		.trim()
		.min(username.minLength, formatMinLength(username.fieldName, username.minLength))
		.max(username.maxLength, formatMaxLength(username.fieldName, username.maxLength))
		.regex(username.regex, 'Username must only contain alphanumeric characters'),
	displayName: z
		.string()
		.trim()
		.max(displayName.maxLength, formatMaxLength(displayName.fieldName, displayName.maxLength))
		.nullish(),
	bio: z
		.string()
		.trim()
		.max(bio.maxLength, formatMaxLength(bio.fieldName, bio.maxLength))
		.nullish(),
	avatar: z.httpUrl().normalize().nullish(),
});

const Credentials = z.object({
	...User.shape,
	password: z
		.string()
		.trim()
		.min(password.minLength, formatMinLength(password.fieldName, password.minLength))
		.max(password.maxLength, formatMaxLength(password.fieldName, password.maxLength)),
});

export const NewUser = Credentials.omit(base);

export const UserUpdate = Credentials.omit(timestamps).partial().required({ id: true });

export type User = z.infer<typeof User>;

export type NewUser = z.input<typeof NewUser>;

export type UserUpdate = z.infer<typeof UserUpdate>;
