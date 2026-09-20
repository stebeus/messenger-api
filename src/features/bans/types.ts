import type { Selection } from '#db/types.ts';
import type { GroupParams } from '#features/conversations/groups/contracts/dtos.ts';
import type { GroupMember, MemberManagement } from '#features/members/types.ts';
import type { UsersSelection } from '#features/users/types.ts';
import type { Ban, CreateBanBody, UpdateBanBody } from './contracts/index.ts';

export type BansSelection = GroupParams & UsersSelection;

export type BanSelection = Selection<Ban>;

export type CreateBanArgs = MemberManagement & CreateBanBody;

export type ListBanArgs = GroupMember & UsersSelection;

export type UpdateBanArgs = MemberManagement & UpdateBanBody;
