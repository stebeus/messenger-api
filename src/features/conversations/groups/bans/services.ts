import type { GroupMember, MemberManagement } from '#features/conversations/groups/types.ts';
import type { CreateBanArgs, ListBanArgs, UpdateBanArgs } from './types.ts';

import { type DatabaseContext, db } from '#db/index.ts';
import { conversationEvents } from '#features/conversations/events.ts';
import { groupPolicy } from '#features/conversations/groups/policies.ts';
import { memberService } from '#features/conversations/members/services.ts';
import { ConflictError, NotFoundError } from '#utils/errors.ts';

import { banRepository } from './repository.ts';

const create = async ({ actorId, targetId, groupId, reason, expiresAt }: CreateBanArgs) =>
	await db.transaction(async (tx) => {
		const ban = await banRepository.findOne({ userId: targetId, groupId, tx });
		if (ban != null) throw new ConflictError({ message: 'User is already banned' });

		const { userId, conversationId } = await memberService.destroy({
			actorId,
			targetId,
			groupId,
			tx,
		});

		const data = await banRepository.create({
			userId,
			groupId: conversationId,
			reason,
			expiresAt,
			tx,
		});

		conversationEvents.publish(data.groupId, { type: 'member_banned', data });

		return data;
	});

const find = async ({ userId, groupId, query }: ListBanArgs) => {
	const { conversationId } = await groupPolicy.authorizeManagement({ actorId: userId, groupId });
	return await banRepository.find({ groupId: conversationId, query });
};

const getOne = async ({ userId, groupId, tx }: DatabaseContext<GroupMember>) => {
	const ban = await banRepository.findOne({ userId, groupId, tx });
	if (ban == null) throw new NotFoundError({ resource: 'ban' });
	return ban;
};

const update = async ({ actorId, targetId, groupId, reason, expiresAt }: UpdateBanArgs) => {
	const { conversationId } = await groupPolicy.authorizeManagement({ actorId, groupId });
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
		const { conversationId } = await groupPolicy.authorizeManagement({ actorId, groupId, tx });
		const ban = await getOne({ userId: targetId, groupId: conversationId, tx });
		const data = await banRepository.destroy({ ...ban, tx });

		conversationEvents.publish(data.groupId, { type: 'member_unbanned', data });

		return data;
	});

export const banService = { create, find, getOne, update, destroy } as const;
