import type { Id } from '#contracts/entity.ts';
import type { DatabaseContext } from '#db/types.ts';
import type { UserPair } from '#features/users/contracts/entity.ts';
import type { DirectMessageMember } from './types.ts';

import { memberService } from '#features/conversations/members/services.ts';
import { conversationRepository } from '#features/conversations/repository.ts';
import { conversationService } from '#features/conversations/services.ts';
import { NotFoundError } from '#utils/errors.ts';

import { dmRepository } from './repository.ts';

const create = async ({ user1Id, user2Id, tx }: DatabaseContext<UserPair>) => {
	const { id, createdAt } = await conversationRepository.create({ tx });

	const createMember = async (userId: Id) =>
		await memberService.create({ userId, conversationId: id, tx });

	const members = await Promise.all(Object.values({ user1Id, user2Id }).map(createMember));

	return { id, createdAt, members } as const;
};

const getOne = async ({ dmId, userId }: DirectMessageMember) => {
	const dm = await dmRepository.findOne({ id: dmId, userId });
	if (dm == null) throw new NotFoundError({ resource: 'direct message' });
	return dm;
};

const getOneByPair = async ({ user1Id, user2Id, tx }: DatabaseContext<UserPair>) => {
	const dm = await dmRepository.findOneByPair({ user1Id, user2Id, tx });
	if (dm == null) throw new NotFoundError({ resource: 'pair direct message' });
	return dm;
};

const purgeByPair = async ({ user1Id, user2Id, tx }: DatabaseContext<UserPair>) => {
	const { id } = await getOneByPair({ user1Id, user2Id, tx });
	return await conversationService.purge({ id, tx });
};

export const dmService = { create, getOne, getOneByPair, purgeByPair } as const;
