import * as z from 'zod';

import { id, Timestamps, timestamps } from '#contracts/entity.ts';
import { formatMaxLength, formatMinLength } from '#utils/formatters.ts';

import { reason } from './constants.ts';

export const Ban = z.object({
	...Timestamps.shape,
	userId: id,
	groupId: id,
	reason: z
		.string()
		.min(reason.minLength, formatMinLength(reason.minLength, reason.fieldName))
		.max(reason.maxLength, formatMaxLength(reason.maxLength, reason.fieldName)),
	expiresAt: z.coerce.date().nullish(),
});

export const NewBan = Ban.omit(timestamps);

export const BanUpdate = Ban.omit(timestamps).partial({ reason: true });

export type Ban = z.infer<typeof Ban>;

export type NewBan = z.infer<typeof NewBan>;

export type BanUpdate = z.infer<typeof BanUpdate>;
