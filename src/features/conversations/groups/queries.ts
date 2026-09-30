import type { GroupParams } from './contracts/dtos.ts';
import type { GroupMember, GroupsSelection } from './types.ts';

import { ForbiddenError, NotFoundError } from '#utils/errors.ts';

import { extractGroupRelations } from './helpers.ts';
import { groupRepository } from './repository.ts';

const find = async ({ userId, query }: GroupsSelection) => {
	const groups = await groupRepository.find({ userId, query });
	return groups.map(extractGroupRelations);
};

const findByMembership = async ({ userId, query }: GroupsSelection) => {
	const groups = await groupRepository.findByMembership({ userId, query });
	return groups.map(extractGroupRelations);
};

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

export const groupQueries = { find, findByMembership, getOne, getOneByOwnership } as const;
