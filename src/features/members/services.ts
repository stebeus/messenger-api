import type {
	GroupMember,
	ListMemberArgs,
	Management,
	MemberArgs,
	MemberManagement,
	RoleManagement,
} from './types.ts';

import { type DatabaseContext, db } from '#db/index.ts';
import { banRepository } from '#features/conversations/groups/bans/repository.ts';
import { banService } from '#features/conversations/groups/bans/services.ts';
import { ForbiddenError, NotFoundError } from '#utils/errors.ts';

import { canManage, canManageMember } from './helpers.ts';
import { memberRepository } from './repository.ts';

const joinGroup = async ({ userId, groupId }: GroupMember) => {
	const ban = await banRepository.findOne({ userId, groupId });
	if (ban != null) throw new ForbiddenError();
	return await memberRepository.create({ userId, conversationId: groupId });
};

const getOne = async ({ groupId, ...args }: DatabaseContext<GroupMember>) => {
	const member = await memberRepository.findOne({ ...args, conversationId: groupId });
	if (member == null) throw new NotFoundError({ resource: 'member' });
	return member;
};

const leaveGroup = async (args: GroupMember) => {
	const { userId, conversationId, role } = await getOne(args);
	if (role === 'owner') throw new ForbiddenError();
	return memberRepository.destroy({ userId, conversationId });
};

const requireMembership = async (args: DatabaseContext<MemberArgs>) => {
	const member = await memberRepository.findOne(args);
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
	...args
}: DatabaseContext<MemberManagement>) => {
	const actor = await authorizeManagement({ ...args, actorId });
	const target = await getOne({ ...args, userId: targetId });

	if (!canManageMember(actor, target)) throw new ForbiddenError();

	return target;
};

const changeRole = async ({ groupId, body, ...args }: RoleManagement) => {
	const { userId } = await authorizeMemberManagement({ ...args, groupId });
	return await memberRepository.update({ ...body, userId, conversationId: groupId });
};

const kick = async ({ groupId, tx, ...args }: DatabaseContext<MemberManagement>) => {
	const { userId } = await authorizeMemberManagement({ ...args, groupId, tx });
	return await memberRepository.destroy({ userId, conversationId: groupId, tx });
};

const ban = async (args: MemberManagement) =>
	await db.transaction(async (tx) => {
		const { userId, conversationId } = await kick({ ...args, tx });
		return await banRepository.create({ userId, groupId: conversationId, tx, reason: 'any' });
	});

const unban = async ({ groupId, actorId, targetId }: MemberManagement) =>
	await db.transaction(async (tx) => {
		const { conversationId } = await authorizeManagement({ groupId, actorId, tx });
		return await banService.destroy({ groupId: conversationId, userId: targetId, tx });
	});

export const memberService = {
	joinGroup,
	leaveGroup,
	find,
	getOne,
	requireMembership,
	authorizeMemberManagement,
	changeRole,
	kick,
	ban,
	unban,
} as const;
