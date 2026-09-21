import type { Id } from '#contracts/entities.ts';
import type { UserPair } from '#features/users/contracts/entity.ts';
import type { DirectMessageMember } from './types.ts';

import { type DatabaseContext, db } from '#db/index.ts';
import { conversationRepository } from '#features/conversations/repository.ts';
import { findFriendship } from '#features/friendships/find-friendship.ts';
import { memberService } from '#features/members/services.ts';
import { ConflictError, ForbiddenError, NotFoundError } from '#utils/errors.ts';

import { dmRepository } from './repository.ts';

const create = async ({ user1Id, user2Id, tx = db }: DatabaseContext<UserPair>) =>
	await tx.transaction(async (tx) => {
		const dm = await dmRepository.findOneByPair({ user1Id, user2Id, tx });
		if (dm != null) throw new ConflictError({ message: 'Direct message already exists' });

		const { id, createdAt } = await conversationRepository.create({ tx });

		const createMember = async (userId: Id) =>
			await memberService.create({ userId, conversationId: id, tx });

		const members = await Promise.all(Object.values({ user1Id, user2Id }).map(createMember));

		return { id, createdAt, members } as const;
	});

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

const destroyByPair = async ({ user1Id, user2Id, tx }: DatabaseContext<UserPair>) => {
	const friendship = await findFriendship({ user1Id, user2Id, tx });

	if (friendship != null) {
		throw new ForbiddenError({
			message: 'Direct message cannot be deleted while the friendship exists',
		});
	}

	const { id } = await getOneByPair({ user1Id, user2Id, tx });

	return conversationRepository.destroy({ id, tx });
};

export const dmService = { create, getOne, getOneByPair, destroyByPair } as const;
