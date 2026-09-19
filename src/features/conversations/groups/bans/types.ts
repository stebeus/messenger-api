import type { Selection } from '#db/types.ts';
import type { GroupParams } from '#features/conversations/groups/contracts/dtos.ts';
import type { GroupMember } from '#features/members/types.ts';
import type { UsersSelection } from '#features/users/types.ts';
import type { Ban } from './contracts/entity.ts';

export type BansSelection = GroupParams & UsersSelection;

export type BanSelection = Selection<Ban>;

export type ListBanArgs = GroupMember & UsersSelection;
