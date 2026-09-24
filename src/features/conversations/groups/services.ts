import type { GroupParams } from './contracts/dtos.ts';
import type { CreateGroupArgs, EditGroupArgs } from './types.ts';

import { db } from '#db/client.ts';
import { conversationEvents } from '#features/conversations/events.ts';
import { conversationRepository } from '#features/conversations/repository.ts';
import { conversationService } from '#features/conversations/services.ts';
import { type GroupMember, memberService } from '#features/members/index.ts';
import { maybeUploadAvatar } from '#lib/storage.ts';
import { ForbiddenError, NotFoundError } from '#utils/errors.ts';

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

const getOne = async ({ groupId }: GroupParams) => {
	const group = await groupRepository.findOne({ conversationId: groupId });
	if (group == null) throw new NotFoundError({ resource: 'group' });
	return group;
};

const getOneByOwnership = async ({ userId, groupId }: GroupMember) => {
	const group = await getOne({ groupId });
	if (group.ownerId !== userId) throw new ForbiddenError();
	return group;
};

const update = async ({ userId, groupId, body: { avatar, ...body } }: EditGroupArgs) => {
	const { conversationId } = await getOneByOwnership({ userId, groupId });
	const avatarUpload = await maybeUploadAvatar(`/groups/${conversationId}`, avatar);

	const data = await groupRepository.update({
		...body,
		conversationId,
		avatar: avatarUpload?.path,
	});

	conversationEvents.publish(data.conversationId, { type: 'group_updated', data });

	return data;
};

const purge = async ({ userId, groupId }: GroupMember) => {
	const { conversationId } = await getOneByOwnership({ userId, groupId });
	return await conversationService.purge({ id: conversationId });
};

export const groupService = { create, update, purge } as const;
