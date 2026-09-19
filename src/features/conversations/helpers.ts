import type { Id } from '#contracts/entities.ts';

export const conversationRelations = { members: true, messages: true } as const;

export const memberOf = (userId: Id) => ({ members: { userId } }) as const;
