import type { QueryArgs } from '#contracts/dtos.ts';
import type { Selection } from '#db/types.ts';
import type { GroupParams } from '#features/conversations/groups/contracts/dtos.ts';
import type { GroupMember, MemberManagement } from '#features/conversations/members/types.ts';
import type { Ban, BanQuery, CreateBanBody, UpdateBanBody } from './contracts/index.ts';

type BanQueryDto = QueryArgs<BanQuery>;

export type BansSelection = GroupParams & BanQueryDto;

export type BanSelection = Selection<Ban>;

export type CreateBanArgs = MemberManagement & CreateBanBody;

export type ListBanArgs = GroupMember & BanQueryDto;

export type UpdateBanArgs = MemberManagement & UpdateBanBody;
