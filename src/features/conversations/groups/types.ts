import type { BodyArgs, Id, QueryArgs } from '#contracts/index.ts';
import type { Selection } from '#db/types.ts';
import type {
	Member,
	roles,
	UpdateMemberBody,
} from '#features/conversations/members/contracts/index.ts';
import type { UserParams } from '#features/users/contracts/dtos.ts';
import type { CreateGroupBody, Group, GroupParams, UpdateGroupBody } from './contracts/index.ts';

export type GroupsSelection = UserParams & QueryArgs;

export type GroupSelection = Selection<Group>;

export type CreateGroupArgs = UserParams & BodyArgs<CreateGroupBody>;

export type GroupMember = UserParams & GroupParams;

export type UpdateGroupArgs = GroupMember & BodyArgs<UpdateGroupBody>;

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
