import type { QueryArgs } from '#contracts/dtos.ts';
import type { Selection } from '#db/types.ts';
import type { User, UserParams, UserQuery } from './contracts/index.ts';

export type UserQueryArgs = QueryArgs<UserQuery>;

export type UsersSelection = UserParams & UserQueryArgs;

export type UserSelection = Selection<User>;
