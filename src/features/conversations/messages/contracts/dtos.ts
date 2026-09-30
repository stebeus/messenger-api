import * as z from 'zod';

import { id } from '#contracts/entity.ts';
import { User } from '#features/users/contracts/entity.ts';

import { Message, MessageUpdate, NewMessage } from './entity.ts';

export const MessageParams = z.object({
	messageId: id,
});

export const CreateMessageBodyRequest = NewMessage.pick({ content: true });

export const UpdateMessageBodyRequest = MessageUpdate.pick({ content: true });

export const ListMessagesResponse = z.array(
	z.object({
		...Message.shape,
		sender: User,
	}),
);

export type MessageParams = z.infer<typeof MessageParams>;

export type CreateMessageBodyRequest = z.infer<typeof CreateMessageBodyRequest>;

export type UpdateMessageBodyRequest = z.infer<typeof UpdateMessageBodyRequest>;

export type ListMessagesResponse = z.infer<typeof ListMessagesResponse>;
