import type { GroupMember } from '#features/members/types.ts';

import { banRepository } from '#features/bans/repository.ts';
import { ForbiddenError } from '#utils/errors.ts';

export const authorizeGroupJoin = async ({ userId, groupId }: GroupMember) => {
	const ban = await banRepository.findOne({ userId, groupId });
	if (ban == null) return;

	const { reason, expiresAt } = ban;

	if (expiresAt != null && expiresAt <= new Date()) {
		return await banRepository.destroy({ userId, groupId });
	}

	throw new ForbiddenError({
		message: 'You have been banned from this group',
		cause: { reason, duration: expiresAt ?? 'Permanent' },
	});
};
