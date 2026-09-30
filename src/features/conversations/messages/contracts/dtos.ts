import * as z from 'zod';

import { User } from '#features/users/contracts/entity.ts';
import { createNotFoundErrorResponse, id } from '#root/src/contracts/index.ts';

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

export const MessageNotFoundErrorResponse = createNotFoundErrorResponse({
	resource: 'message',
});

export type MessageParams = z.infer<typeof MessageParams>;

export type CreateMessageBodyRequest = z.infer<typeof CreateMessageBodyRequest>;

export type UpdateMessageBodyRequest = z.infer<typeof UpdateMessageBodyRequest>;

export type ListMessagesResponse = z.infer<typeof ListMessagesResponse>;
