import type { BodyDto, QueryDto } from '#contracts/dtos.ts';
import type { Selection } from '#db/types.ts';
import type { GroupMember } from '#features/conversations/members/types.ts';
import type { UserParams } from '#features/users/contracts/dtos.ts';
import type { CreateGroupBody, Group, UpdateGroupBody } from './contracts/index.ts';

export type GroupsSelection = UserParams & QueryDto;

export type GroupSelection = Selection<Group>;

export type CreateGroupArgs = UserParams & BodyDto<CreateGroupBody>;

export type EditGroupArgs = GroupMember & BodyDto<UpdateGroupBody>;
