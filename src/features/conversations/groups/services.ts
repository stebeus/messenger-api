import type { GroupMember } from '#features/conversations/members/types.ts';
import type { GroupParams } from './contracts/dtos.ts';
import type { CreateGroupArgs, EditGroupArgs } from './types.ts';

import { db } from '#db/client.ts';
import { memberService } from '#features/conversations/members/services.ts';
import { conversationRepository } from '#features/conversations/repository.ts';
import { ForbiddenError, NotFoundError } from '#utils/errors.ts';

import { groupRepository } from './repository.ts';

const create = async ({ userId, body }: CreateGroupArgs) =>
	await db.transaction(async (tx) => {
		const { id } = await conversationRepository.create({ type: 'group', tx });
		const member = await memberService.create({ userId, conversationId: id, role: 'owner', tx });

		return await groupRepository.create({
			...body,
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

const update = async ({ userId, groupId, body }: EditGroupArgs) => {
	const { conversationId } = await getOneByOwnership({ userId, groupId });
	return await groupRepository.update({ ...body, conversationId });
};

const destroy = async ({ userId, groupId }: GroupMember) => {
	const { conversationId } = await getOneByOwnership({ userId, groupId });
	return await conversationRepository.destroy({ id: conversationId });
};

export const groupService = { create, update, destroy } as const;
