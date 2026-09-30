import * as z from 'zod';

import { createNotFoundErrorResponse, id } from '#contracts/index.ts';

export const ConversationParams = z.object({
	conversationId: id,
});

export const ConversationNotFoundErrorResponse = createNotFoundErrorResponse({
	resource: 'conversation',
});

export type ConversationParams = z.infer<typeof ConversationParams>;
