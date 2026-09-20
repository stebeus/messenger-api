import type { Selection } from '#db/types.ts';
import type { Friendship } from './contracts/entity.ts';
import type { friendshipRepository } from './repository.ts';

export type FriendshipSelection = Selection<Friendship>;

export type FriendshipSelectionResult = Partial<
	Awaited<ReturnType<typeof friendshipRepository.findOne>>
>;
