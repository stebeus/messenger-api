import * as z from 'zod';

import { id } from '#contracts/entity.ts';

export const ConversationParams = z.object({
	conversationId: id,
});

export type ConversationParams = z.infer<typeof ConversationParams>;
