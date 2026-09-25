import type { DatabaseContext } from '#db/types.ts';
import type {
	GroupMember,
	MemberManagement,
	RoleManagement,
} from '#features/conversations/groups/types.ts';
import type { NewMember } from './contracts/entity.ts';
import type { ListMemberArgs } from './types.ts';

import { conversationEvents } from '#features/conversations/events.ts';
import { groupPolicy } from '#features/conversations/groups/policies.ts';
import { conversationPolicy } from '#features/conversations/policies.ts';
import { ConflictError, ForbiddenError, NotFoundError } from '#utils/errors.ts';

import { memberRepository } from './repository.ts';

const create = async ({ userId, conversationId, role, tx }: DatabaseContext<NewMember>) => {
	const member = await memberRepository.findOne({ userId, conversationId, tx });
	if (member != null) throw new ConflictError({ resource: 'member' });

	const data = await memberRepository.create({ userId, conversationId, role, tx });

	conversationEvents.publish(data.conversationId, { type: 'member.joined', data });

	return data;
};

const joinGroup = async ({ userId, groupId }: GroupMember) => {
	await groupPolicy.authorizeJoin({ userId, groupId });
	return await create({ userId, conversationId: groupId });
};

const find = async ({ userId, groupId, query }: ListMemberArgs) => {
	const { conversationId } = await conversationPolicy.requireMembership({
		userId,
		conversationId: groupId,
	});

	return await memberRepository.find({ conversationId, query });
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

	conversationEvents.publish(data.conversationId, { type: 'member.left', data });

	return data;
};

const changeRole = async ({ actorId, targetId, groupId, role }: RoleManagement) => {
	const { userId } = await groupPolicy.authorizeMemberManagement({ actorId, targetId, groupId });

	const data = await memberRepository.update({
		userId,
		conversationId: groupId,
		role,
	});

	conversationEvents.publish(data.conversationId, { type: 'member.updated', data });

	return data;
};

const destroy = async ({ actorId, targetId, groupId, tx }: DatabaseContext<MemberManagement>) => {
	const { userId } = await groupPolicy.authorizeMemberManagement({
		actorId,
		targetId,
		groupId,
		tx,
	});

	return await memberRepository.destroy({ userId, conversationId: groupId, tx });
};

const kick = async ({ actorId, targetId, groupId }: MemberManagement) => {
	const data = await destroy({ actorId, targetId, groupId });
	conversationEvents.publish(data.conversationId, { type: 'member.kicked', data });
	return data;
};

export const memberService = {
	create,
	joinGroup,
	leaveGroup,
	find,
	getOne,
	changeRole,
	destroy,
	kick,
} as const;
