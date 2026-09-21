import type { QueryDto } from '#contracts/dtos.ts';
import type { Selection } from '#db/types.ts';
import type { GroupParams } from '#features/conversations/groups/contracts/dtos.ts';
import type { GroupMember, MemberManagement } from '#features/members/types.ts';
import type { Ban, BanQuery, CreateBanBody, UpdateBanBody } from './contracts/index.ts';

type BanQueryDto = QueryDto<BanQuery>;

export type BansSelection = GroupParams & BanQueryDto;

export type BanSelection = Selection<Ban>;

export type CreateBanArgs = MemberManagement & CreateBanBody;

export type ListBanArgs = GroupMember & BanQueryDto;

export type UpdateBanArgs = MemberManagement & UpdateBanBody;
