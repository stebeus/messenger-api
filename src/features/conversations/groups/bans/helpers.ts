import type { GroupMember } from '#features/conversations/groups/types.ts';

import { and, eq } from 'drizzle-orm';

import { bans } from '#db/schemas/conversation.ts';

export const banRelations = { user: true, group: true } as const;

export const isBan = ({ userId, groupId }: GroupMember) =>
	and(eq(bans.userId, userId), eq(bans.groupId, groupId));
