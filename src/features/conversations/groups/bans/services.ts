import type { GroupMember, MemberManagement } from '#features/members/types.ts';
import type { CreateBanArgs, ListBanArgs, UpdateBanArgs } from './types.ts';

import { type DatabaseContext, db } from '#db/index.ts';
import { memberService } from '#features/members/services.ts';
import { ConflictError, ForbiddenError, NotFoundError } from '#utils/errors.ts';

import { banRepository } from './repository.ts';

const create = async ({ actorId, targetId, groupId, reason, expiresAt }: CreateBanArgs) =>
	await db.transaction(async (tx) => {
		const ban = await banRepository.findOne({ userId: targetId, groupId, tx });
		if (ban != null) throw new ConflictError();

		const { userId, conversationId } = await memberService.kick({ actorId, targetId, groupId, tx });
		return await banRepository.create({ userId, groupId: conversationId, reason, expiresAt, tx });
	});

const find = async ({ userId, groupId, query }: ListBanArgs) => {
	const { conversationId } = await memberService.authorizeManagement({ actorId: userId, groupId });
	return banRepository.find({ groupId: conversationId, query });
};

const getOne = async ({ userId, groupId, tx }: DatabaseContext<GroupMember>) => {
	const ban = await banRepository.findOne({ userId, groupId, tx });
	if (ban == null) throw new NotFoundError({ resource: 'ban' });
	return ban;
};

const authorizeGroupJoin = async (member: GroupMember) => {
	const ban = await banRepository.findOne(member);
	if (ban != null) throw new ForbiddenError();
	return member;
};

const update = async ({ actorId, targetId, groupId, reason, expiresAt }: UpdateBanArgs) => {
	const { conversationId } = await memberService.authorizeManagement({ actorId, groupId });
	const ban = await getOne({ userId: targetId, groupId: conversationId });

	return await banRepository.update({
		userId: ban.userId,
		groupId: ban.groupId,
		reason,
		expiresAt,
	});
};

const destroy = async ({ actorId, targetId, groupId }: MemberManagement) =>
	await db.transaction(async (tx) => {
		const { conversationId } = await memberService.authorizeManagement({ actorId, groupId, tx });
		const ban = await getOne({ userId: targetId, groupId: conversationId, tx });
		return await banRepository.destroy({ ...ban, tx });
	});

export const banService = { create, find, getOne, authorizeGroupJoin, update, destroy } as const;
