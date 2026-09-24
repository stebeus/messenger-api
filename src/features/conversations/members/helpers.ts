import type { MemberArgs } from './types.ts';

import { and, eq } from 'drizzle-orm';

import { members } from '#db/schemas/conversation.ts';

export const memberRelations = { user: true } as const;

export const isMember = ({ userId, conversationId }: MemberArgs) =>
	and(eq(members.userId, userId), eq(members.conversationId, conversationId));
