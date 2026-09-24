import type { QueryArgs } from '#contracts/dtos.ts';
import type { Selection } from '#db/types.ts';
import type { UserParams } from '#features/users/contracts/dtos.ts';
import type { FriendRequest, FriendRequestQuery } from './contracts/index.ts';

export type FriendRequestsSelection = UserParams & QueryArgs<FriendRequestQuery>;

export type FriendRequestSelection = Selection<FriendRequest>;

export type FriendRequestArgs = Pick<FriendRequest, 'requesterId' | 'recipientId'>;
