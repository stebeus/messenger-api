import type { GroupParams } from './contracts/dtos.ts';
import type { GroupMember } from './types.ts';

import { ForbiddenError, NotFoundError } from '#utils/errors.ts';

import { groupRepository } from './repository.ts';

const getOne = async ({ groupId }: GroupParams) => {
	const group = await groupRepository.findOne({ conversationId: groupId });
	if (group == null) throw new NotFoundError({ resource: 'group' });
	return group;
};

const getOneByOwnership = async ({ userId, groupId }: GroupMember) => {
	const group = await getOne({ groupId });
	if (group.ownerId !== userId) throw new ForbiddenError();
	return group;
};

export const groupQueries = { getOne, getOneByOwnership } as const;
