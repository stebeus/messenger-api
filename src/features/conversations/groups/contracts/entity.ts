import * as z from 'zod';

import { id, Timestamps, timestamps } from '#contracts/entity.ts';
import { formatMaxLength, formatMinLength } from '#utils/formatters.ts';

import { name } from './constants.ts';

export const visibilities = ['private', 'public'] as const;

export const Group = z.object({
	...Timestamps.shape,
	conversationId: id,
	ownerId: id,
	name: z
		.string()
		.min(name.minLength, formatMinLength(name.minLength, name.fieldName))
		.max(name.maxLength, formatMaxLength(name.maxLength, name.fieldName)),
	description: z.string().nullish(),
	avatar: z.httpUrl().normalize().nullish(),
	visibility: z.enum(visibilities).default('private'),
});

export const NewGroup = Group.omit(timestamps);

export const GroupUpdate = Group.omit({ ...timestamps, ownerId: true })
	.partial()
	.required({ conversationId: true });

export type Group = z.infer<typeof Group>;

export type NewGroup = z.input<typeof NewGroup>;

export type GroupUpdate = z.infer<typeof GroupUpdate>;
