import type { Id } from '#contracts/entities.ts';
import type { Selection } from '#db/types.ts';
import type { ConversationParams } from '#features/conversations/contracts/dtos.ts';
import type { GroupParams } from '#features/conversations/groups/contracts/dtos.ts';
import type { UserParams } from '#features/users/contracts/dtos.ts';
import type { UsersSelection } from '#features/users/types.ts';
import type { Member, roles, UpdateMemberBody } from './contracts/index.ts';

export type MembersSelection = ConversationParams & UsersSelection;

export type MemberSelection = Selection<Member>;

export type MemberArgs = Pick<Member, 'userId' | 'conversationId'>;

export type GroupMember = UserParams & GroupParams;

export type ListMemberArgs = GroupMember & UsersSelection;

export type Role = Member['role'];

export type Roles = typeof roles;

export type Hierarchy = Readonly<Record<Role, number>>;

export type Management = GroupParams & {
	actorId: Id;
};

export type MemberManagement = Management & {
	targetId: Id;
};

export type RoleManagement = MemberManagement & UpdateMemberBody;
