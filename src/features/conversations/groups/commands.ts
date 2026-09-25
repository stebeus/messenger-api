import type { CreateGroupArgs, GroupMember, UpdateGroupArgs } from './types.ts';

import { db } from '#db/client.ts';
import { conversationEvents } from '#features/conversations/events.ts';
import { memberService } from '#features/conversations/members/services.ts';
import { conversationRepository } from '#features/conversations/repository.ts';
import { conversationService } from '#features/conversations/services.ts';
import { maybeUploadAvatar } from '#lib/storage.ts';

import { groupQueries } from './queries.ts';
import { groupRepository } from './repository.ts';

const create = async ({ userId, body: { avatar, ...body } }: CreateGroupArgs) =>
	await db.transaction(async (tx) => {
		const { id } = await conversationRepository.create({ type: 'group', tx });
		const member = await memberService.create({ userId, conversationId: id, role: 'owner', tx });

		const avatarUpload = await maybeUploadAvatar(`/groups/${id}`, avatar);

		return await groupRepository.create({
			...body,
			avatar: avatarUpload?.fullPath,
			conversationId: member.conversationId,
			ownerId: member.userId,
			tx,
		});
	});

const update = async ({ userId, groupId, body: { avatar, ...body } }: UpdateGroupArgs) => {
	const { conversationId } = await groupQueries.getOneByOwnership({ userId, groupId });
	const avatarUpload = await maybeUploadAvatar(`/groups/${conversationId}`, avatar);

	const data = await groupRepository.update({
		...body,
		conversationId,
		avatar: avatarUpload?.path,
	});

	conversationEvents.publish(data.conversationId, { type: 'group.updated', data });

	return data;
};

const destroy = async ({ userId, groupId }: GroupMember) => {
	const { conversationId } = await groupQueries.getOneByOwnership({ userId, groupId });
	return await conversationService.destroy({ id: conversationId });
};

export const groupService = { create, update, destroy } as const;
