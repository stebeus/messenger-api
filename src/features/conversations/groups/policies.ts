import type { DatabaseContext } from '#db/types.ts';
import type { GroupMember, Hierarchy, Management, MemberManagement, Role, Roles } from './types.ts';

import { type Member, roles } from '#features/conversations/members/contracts/entity.ts';
import { memberRepository } from '#features/conversations/members/repository.ts';
import { conversationPolicy } from '#features/conversations/policies.ts';
import { ForbiddenError, NotFoundError } from '#utils/errors.ts';

import { banRepository } from './bans/repository.ts';

const authorizeJoin = async ({ userId, groupId }: GroupMember) => {
	const ban = await banRepository.findOne({ userId, groupId });
	if (ban == null) return;

	const { reason, expiresAt } = ban;

	if (expiresAt != null && expiresAt <= new Date()) {
		return await banRepository.destroy({ userId, groupId });
	}

	throw new ForbiddenError({
		message: 'You have been banned from this group',
		details: { reason, duration: expiresAt ?? 'Permanent' },
	});
};

const authorizeManagement = async ({ actorId, groupId, tx }: DatabaseContext<Management>) => {
	const actor = await conversationPolicy.requireMembership({
		userId: actorId,
		conversationId: groupId,
		tx,
	});

	if (actor.role === 'member') throw new ForbiddenError();

	return actor;
};

const getManagedMember = async ({ userId, groupId }: GroupMember) => {
	const target = await memberRepository.findOne({ userId, conversationId: groupId });
	if (target == null) throw new NotFoundError({ resource: 'managed member' });
	return target;
};

const createHierarchy = (roles: Roles) => {
	const createLevel = (role: Role, level: number) => [role, level];
	return Object.fromEntries(roles.map(createLevel)) as Hierarchy;
};

const canManageMember = (actor: Member, target: Member) => {
	const hierarchy = createHierarchy(roles);
	return hierarchy[actor.role] > hierarchy[target.role];
};

const authorizeMemberManagement = async ({
	actorId,
	targetId,
	groupId,
}: DatabaseContext<MemberManagement>) => {
	const actor = await authorizeManagement({ actorId, groupId });
	const target = await getManagedMember({ userId: targetId, groupId });

	if (!canManageMember(actor, target)) throw new ForbiddenError();

	return target;
};

export const groupPolicy = {
	authorizeJoin,
	authorizeManagement,
	authorizeMemberManagement,
} as const;
