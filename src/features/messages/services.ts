import type { MessageParams } from './contracts/dtos.ts';
import type {
	EditManagedMessageArgs,
	EditMessageArgs,
	ListMessageArgs,
	MessageManagement,
	SendMessageArgs,
	SentMessage,
} from './types.ts';

import { memberService } from '#features/members/services.ts';
import { ForbiddenError, NotFoundError } from '#utils/errors.ts';

import { messageRepository } from './repository.ts';

const send = async ({ userId, conversationId, body }: SendMessageArgs) => {
	const member = await memberService.requireMembership({ conversationId, userId });

	return await messageRepository.create({
		...body,
		senderId: member.userId,
		conversationId: member.conversationId,
	});
};

const find = async ({ userId, conversationId, query }: ListMessageArgs) => {
	const member = await memberService.requireMembership({ userId, conversationId });
	return messageRepository.find({ conversationId: member.conversationId, query });
};

const getOne = async ({ messageId }: MessageParams) => {
	const message = await messageRepository.findOne({ id: messageId });
	if (message == null) throw new NotFoundError({ resource: 'message' });
	return message;
};

const getOneBySender = async ({ messageId, userId }: SentMessage) => {
	const message = await getOne({ messageId });
	if (message.senderId !== userId) throw new ForbiddenError();
	return message;
};

const edit = async ({ userId, messageId, body }: EditMessageArgs) => {
	const { id } = await getOneBySender({ userId, messageId });
	return await messageRepository.update({ ...body, id });
};

const destroy = async ({ userId, messageId }: SentMessage) => {
	const { id } = await getOneBySender({ userId, messageId });
	return await messageRepository.destroy({ id });
};

const editWithPermission = async ({
	actorId,
	groupId,
	messageId,
	body,
}: EditManagedMessageArgs) => {
	const { id, senderId } = await getOne({ messageId });
	await memberService.authorizeMemberManagement({ actorId, groupId, targetId: senderId });
	return await messageRepository.update({ ...body, id });
};

const destroyWithPermission = async ({ actorId, groupId, messageId }: MessageManagement) => {
	const { id, senderId } = await getOne({ messageId });
	await memberService.authorizeMemberManagement({ actorId, groupId, targetId: senderId });
	return await messageRepository.destroy({ id });
};

export const messageService = {
	send,
	find,
	edit,
	destroy,
	editWithPermission,
	destroyWithPermission,
} as const;
