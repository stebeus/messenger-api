import type { GroupMember } from '#features/conversations/members/types.ts';

import { ForbiddenError } from '#utils/errors.ts';

import { banRepository } from './repository.ts';

export const authorizeGroupJoin = async ({ userId, groupId }: GroupMember) => {
	const ban = await banRepository.findOne({ userId, groupId });
	if (ban == null) return;

	const { reason, expiresAt } = ban;

	if (expiresAt != null && expiresAt <= new Date()) {
		return await banRepository.purge({ userId, groupId });
	}

	throw new ForbiddenError({
		message: 'You have been banned from this group',
		details: { reason, duration: expiresAt ?? 'Permanent' },
	});
};
