import type { DatabaseContext } from '#db/types.ts';
import type { GroupMember } from '#features/members/types.ts';

import { NotFoundError } from '#utils/errors.ts';

import { banRepository } from './repository.ts';

const getOne = async (args: DatabaseContext<GroupMember>) => {
	const ban = await banRepository.findOne(args);
	if (ban == null) throw new NotFoundError({ resource: 'ban' });
	return ban;
};

const destroy = async ({ tx, ...args }: DatabaseContext<GroupMember>) => {
	const { userId, groupId } = await getOne({ ...args, tx });
	return await banRepository.destroy({ userId, groupId, tx });
};

export const banService = { getOne, destroy } as const;
