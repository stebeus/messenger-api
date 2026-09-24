import type { DatabaseContext } from '#db/types.ts';
import type { MemberArgs } from './members/types.ts';

import { ForbiddenError } from '#utils/errors.ts';

import { memberRepository } from './members/repository.ts';

const requireMembership = async ({ userId, conversationId, tx }: DatabaseContext<MemberArgs>) => {
	const member = await memberRepository.findOne({ userId, conversationId, tx });
	if (member == null) throw new ForbiddenError();
	return member;
};

export const conversationPolicy = { requireMembership } as const;
