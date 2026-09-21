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

import { banRepository } from '#features/bans/repository.ts';
import { ConflictError, ForbiddenError, NotFoundError } from '#utils/errors.ts';

import { canManage, canManageMember } from './helpers.ts';
import { memberRepository } from './repository.ts';

const create = async ({ userId, conversationId, role, tx }: DatabaseContext<NewMember>) => {
	const member = await memberRepository.findOne({ userId, conversationId, tx });
	if (member != null) throw new ConflictError({ message: 'Member already exists' });
	return await memberRepository.create({ userId, conversationId, role, tx });
};

const joinGroup = async ({ userId, groupId }: GroupMember) => {
	const ban = await banRepository.findOne({ userId, groupId });
	if (ban != null) throw new ForbiddenError();
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
	return memberRepository.destroy(member);
};

const requireMembership = async ({ userId, conversationId, tx }: DatabaseContext<MemberArgs>) => {
	const member = await memberRepository.findOne({ userId, conversationId, tx });
	if (member == null) throw new ForbiddenError();
	return member;
};

const find = async ({ userId, groupId, query }: ListMemberArgs) => {
	const { conversationId } = await requireMembership({ userId, conversationId: groupId });
	return memberRepository.find({ conversationId, query });
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

	return target;
};

const changeRole = async ({ actorId, targetId, groupId, role }: RoleManagement) => {
	const { userId } = await authorizeMemberManagement({ actorId, targetId, groupId });
	return await memberRepository.update({ userId, conversationId: groupId, role });
};

const kick = async ({ actorId, targetId, groupId, tx }: DatabaseContext<MemberManagement>) => {
	const { userId } = await authorizeMemberManagement({ actorId, targetId, groupId, tx });
	return await memberRepository.destroy({ userId, conversationId: groupId, tx });
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
	kick,
} as const;
