import type { Selection } from '#db/types.ts';
import type { ConversationParams } from '#features/conversations/contracts/dtos.ts';
import type { GroupMember } from '#features/conversations/groups/types.ts';
import type { UserQueryArgs } from '#features/users/types.ts';
import type { Member } from './contracts/index.ts';

export type MembersSelection = ConversationParams & UserQueryArgs;

export type MemberSelection = Selection<Member>;

export type MemberArgs = Pick<Member, 'userId' | 'conversationId'>;

export type ListMemberArgs = GroupMember & UserQueryArgs;
