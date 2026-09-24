import * as z from 'zod';

import { Base, base, id } from '#contracts/entity.ts';
import { formatMaxLength, formatMinLength } from '#utils/formatters.ts';

import { content } from './constants.ts';

export const Message = z.object({
	...Base.shape,
	senderId: id,
	conversationId: id,
	content: z
		.string()
		.trim()
		.min(content.minLength, formatMinLength(content.minLength, content.fieldName))
		.max(content.maxLength, formatMaxLength(content.maxLength, content.fieldName)),
});

export const NewMessage = Message.omit(base);

export const MessageUpdate = Message.pick({ id: true, content: true }).partial({ content: true });

export type Message = z.infer<typeof Message>;

export type NewMessage = z.infer<typeof NewMessage>;

export type MessageUpdate = z.infer<typeof MessageUpdate>;
