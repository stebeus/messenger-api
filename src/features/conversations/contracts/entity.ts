import type * as z from 'zod';

import { createInsertSchema, createSelectSchema } from 'drizzle-orm/zod';

import { conversations } from '#db/schemas/messaging.ts';

export const Conversation = createSelectSchema(conversations);

export const NewConversation = createInsertSchema(conversations).pick({ type: true });

export type Conversation = z.infer<typeof Conversation>;

export type NewConversation = z.infer<typeof NewConversation>;
