import type { MessageParams } from './contracts/dtos.ts';
import type {
	EditManagedMessageArgs,
	EditMessageArgs,
	ListMessageArgs,
	MessageManagement,
	SendMessageArgs,
	SentMessage,
} from './types.ts';

import { conversationEvents } from '#features/conversations/events.ts';
import { memberService } from '#features/conversations/members/services.ts';
import { ForbiddenError, NotFoundError } from '#utils/errors.ts';

import { messageRepository } from './repository.ts';

const send = async ({ userId, conversationId, body }: SendMessageArgs) => {
	const member = await memberService.requireMembership({ conversationId, userId });

	const data = await messageRepository.create({
		...body,
		senderId: member.userId,
		conversationId: member.conversationId,
	});

	conversationEvents.publish(data.conversationId, { type: 'message_sent', data });

	return data;
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
	const data = await messageRepository.update({ ...body, id });

	conversationEvents.publish(data.conversationId, { type: 'message_edited', data });

	return data;
};

const purge = async ({ userId, messageId }: SentMessage) => {
	const { id } = await getOneBySender({ userId, messageId });
	const data = await messageRepository.purge({ id });

	conversationEvents.publish(data.conversationId, { type: 'message_deleted', data });

	return data;
};

const editWithPermission = async ({
	actorId,
	groupId,
	messageId,
	body,
}: EditManagedMessageArgs) => {
	const { id, senderId } = await getOne({ messageId });
	await memberService.authorizeMemberManagement({ actorId, targetId: senderId, groupId });

	const data = await messageRepository.update({ ...body, id });

	conversationEvents.publish(data.conversationId, { type: 'message_edited', data });

	return data;
};

const purgeWithPermission = async ({ actorId, groupId, messageId }: MessageManagement) => {
	const { id, senderId } = await getOne({ messageId });
	await memberService.authorizeMemberManagement({ actorId, targetId: senderId, groupId });

	const data = await messageRepository.purge({ id });

	conversationEvents.publish(data.conversationId, { type: 'message_deleted', data });

	return data;
};

export const messageService = {
	send,
	find,
	edit,
	purge,
	editWithPermission,
	purgeWithPermission,
} as const;
