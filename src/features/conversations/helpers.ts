import type { Id } from '#contracts/entity.ts';

export const conversationRelations = { members: true, messages: true } as const;

export const memberOf = (userId: Id) => ({ members: { userId } }) as const;
