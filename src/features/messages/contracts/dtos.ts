import * as z from 'zod';

import { id } from '#contracts/entities.ts';

import { MessageUpdate, NewMessage } from './entity.ts';

export const MessageParams = z.object({
	messageId: id,
});

export const CreateMessageBody = NewMessage.pick({ content: true });

export const UpdateMessageBody = MessageUpdate.pick({ content: true });

export type MessageParams = z.infer<typeof MessageParams>;

export type CreateMessageBody = z.infer<typeof CreateMessageBody>;

export type UpdateMessageBody = z.infer<typeof UpdateMessageBody>;
