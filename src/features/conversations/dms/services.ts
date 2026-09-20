import type { Id } from '#contracts/entities.ts';
import type { DatabaseContext } from '#db/index.ts';
import type { UserPair } from '#features/users/contracts/entity.ts';
import type { DirectMessageMember } from './types.ts';

import { conversationRepository } from '#features/conversations/repository.ts';
import { memberRepository } from '#features/members/repository.ts';
import { NotFoundError } from '#utils/errors.ts';

import { dmRepository } from './repository.ts';

const create = async ({ tx, ...params }: DatabaseContext<UserPair>) => {
	const dm = await conversationRepository.create({ tx });

	const createMember = async (userId: Id) =>
		await memberRepository.create({ userId, conversationId: dm.id, tx });

	const members = await Promise.all(Object.values(params).map(createMember));

	return { ...dm, members } as const;
};

const getOne = async ({ dmId, userId }: DirectMessageMember) => {
	const dm = await dmRepository.findOne({ id: dmId, userId });
	if (dm == null) throw new NotFoundError({ resource: 'direct message' });
	return dm;
};

const getOneByPair = async (params: DatabaseContext<UserPair>) => {
	const dm = await dmRepository.findOneByPair(params);
	if (dm == null) throw new NotFoundError({ resource: 'pair direct message' });
	return dm;
};

const destroyByPair = async ({ tx, ...params }: DatabaseContext<UserPair>) => {
	const { id } = await getOneByPair({ ...params, tx });
	return conversationRepository.destroy({ id, tx });
};

export const dmService = { create, getOne, destroyByFriendship: destroyByPair } as const;
