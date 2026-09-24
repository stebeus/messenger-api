import type { Id } from '#contracts/entity.ts';

import { contains } from '#db/helpers.ts';
import { conversationRelations, memberOf } from '#features/conversations/helpers.ts';

type GroupRelationOptions = Partial<{
	members: true;
	messages: true;
}>;

const createGroupRelations = (relations: GroupRelationOptions) =>
	({ conversation: { with: relations }, owner: true }) as const;

export const groupRelations = createGroupRelations(conversationRelations);

export const groupSearchRelations = createGroupRelations({ members: true });

export const containsName = (name?: string) =>
	name == null ? undefined : ({ name: contains(name) } as const);

export const memberOfGroup = (userId: Id) => ({ conversation: { ...memberOf(userId) } }) as const;
