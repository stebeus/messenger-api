import type { BodyArgs, QueryArgs } from '#contracts/dtos.ts';
import type { Selection } from '#db/types.ts';
import type { GroupParams } from '#features/conversations/groups/contracts/dtos.ts';
import type { GroupMember, MemberManagement } from '#features/conversations/groups/types.ts';
import type {
	Ban,
	BanQuery,
	CreateBanBodyRequest,
	UpdateBanBodyRequest,
} from './contracts/index.ts';

type BanQueryArgs = QueryArgs<BanQuery>;

export type BansSelection = GroupParams & BanQueryArgs;

export type BanSelection = Selection<Ban>;

export type CreateBanArgs = MemberManagement & BodyArgs<CreateBanBodyRequest>;

export type ListBanArgs = GroupMember & BanQueryArgs;

export type UpdateBanArgs = MemberManagement & BodyArgs<UpdateBanBodyRequest>;
