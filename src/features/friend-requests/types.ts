import type { Selection } from '#db/types.ts';
import type { FriendRequest } from './contracts/entity.ts';

export type FriendRequestSelection = Selection<FriendRequest>;

export type FriendRequestArgs = Pick<FriendRequest, 'requesterId' | 'recipientId'>;
