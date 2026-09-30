import * as z from 'zod';

import { id } from '#contracts/entity.ts';
import { Conversation } from '#features/conversations/contracts/entity.ts';
import { Member } from '#features/conversations/members/contracts/entity.ts';
import { Message } from '#features/conversations/messages/contracts/entity.ts';

export const DirectMessageParams = z.object({
	dmId: id,
});

export const GetDirectMessageResponse = z.object({
	...Conversation.omit({ type: true }).shape,
	members: z.array(Member),
	messages: z.array(Message),
});

export const ListDirectMessagesResponse = z.array(GetDirectMessageResponse);

export type DirectMessageParams = z.infer<typeof DirectMessageParams>;

export type GetDirectMessageResponse = z.infer<typeof GetDirectMessageResponse>;

export type ListDirectMessagesResponse = z.infer<typeof ListDirectMessagesResponse>;
