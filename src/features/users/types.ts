import type { QueryDto } from '#contracts/dtos.ts';
import type { Selection } from '#db/types.ts';
import type { User, UserParams, UserQuery } from './contracts/index.ts';

export type UsersSelection = QueryDto<UserQuery>;

export type UserSelection = Selection<User>;

export type ListUserArgs = UserParams & UsersSelection;
