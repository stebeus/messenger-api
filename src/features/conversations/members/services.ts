import type { DatabaseContext } from '#db/types.ts';
import type { NewMember } from './contracts/entity.ts';
import type {
	GroupMember,
	ListMemberArgs,
	Management,
	MemberArgs,
	MemberManagement,
	RoleManagement,
} from './types.ts';

import { conversationEvents } from '#features/conversations/events.ts';
import { authorizeGroupJoin } from '#features/conversations/groups/bans/authorization.ts';
import { ConflictError, ForbiddenError, NotFoundError } from '#utils/errors.ts';

import { canManage, canManageMember } from './helpers.ts';
import { memberRepository } from './repository.ts';

const create = async ({ userId, conversationId, role, tx }: DatabaseContext<NewMember>) => {
	const member = await memberRepository.findOne({ userId, conversationId, tx });
	if (member != null) throw new ConflictError({ resource: 'member' });

	const data = await memberRepository.create({ userId, conversationId, role, tx });

	conversationEvents.publish(data.conversationId, { type: 'member_joined', data });

	return data;
};

const joinGroup = async ({ userId, groupId }: GroupMember) => {
	await authorizeGroupJoin({ userId, groupId });
	return await create({ userId, conversationId: groupId });
};

const getOne = async ({ userId, groupId, tx }: DatabaseContext<GroupMember>) => {
	const member = await memberRepository.findOne({ userId, conversationId: groupId, tx });
	if (member == null) throw new NotFoundError({ resource: 'member' });
	return member;
};

const leaveGroup = async ({ userId, groupId }: GroupMember) => {
	const member = await getOne({ userId, groupId });
	if (member.role === 'owner') throw new ForbiddenError();

	const data = await memberRepository.destroy(member);

	conversationEvents.publish(data.conversationId, { type: 'member_left', data });

	return data;
};

const requireMembership = async ({ userId, conversationId, tx }: DatabaseContext<MemberArgs>) => {
	const member = await memberRepository.findOne({ userId, conversationId, tx });
	if (member == null) throw new ForbiddenError();
	return member;
};

const find = async ({ userId, groupId, query }: ListMemberArgs) => {
	const { conversationId } = await requireMembership({ userId, conversationId: groupId });
	return await memberRepository.find({ conversationId, query });
};

const authorizeManagement = async ({ actorId, groupId, tx }: DatabaseContext<Management>) => {
	const actor = await requireMembership({ userId: actorId, conversationId: groupId, tx });
	if (!canManage(actor)) throw new ForbiddenError();
	return actor;
};

const authorizeMemberManagement = async ({
	actorId,
	targetId,
	groupId,
}: DatabaseContext<MemberManagement>) => {
	const actor = await authorizeManagement({ actorId, groupId });
	const target = await getOne({ userId: targetId, groupId });

	if (!canManageMember(actor, target)) throw new ForbiddenError();

	return { actor, target } as const;
};

const changeRole = async ({ actorId, targetId, groupId, role }: RoleManagement) => {
	const { actor, target } = await authorizeMemberManagement({ actorId, targetId, groupId });

	const data = await memberRepository.update({
		userId: target.userId,
		conversationId: groupId,
		role,
	});

	conversationEvents.publish(data.conversationId, { type: 'member_updated', data });

	return data;
};

const destroy = async ({ actorId, targetId, groupId, tx }: DatabaseContext<MemberManagement>) => {
	const { target } = await authorizeMemberManagement({ actorId, targetId, groupId, tx });
	return await memberRepository.destroy({ userId: target.userId, conversationId: groupId, tx });
};

const kick = async ({ actorId, targetId, groupId }: MemberManagement) => {
	const data = await destroy({ actorId, targetId, groupId });
	conversationEvents.publish(data.conversationId, { type: 'member_kicked', data });
	return data;
};

export const memberService = {
	create,
	joinGroup,
	leaveGroup,
	find,
	getOne,
	requireMembership,
	authorizeManagement,
	authorizeMemberManagement,
	changeRole,
	destroy,
	kick,
} as const;
