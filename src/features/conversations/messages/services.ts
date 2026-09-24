import type { IdArgs } from '#contracts/entity.ts';
import type { MessageParams, MessageUpdate } from './contracts/index.ts';
import type {
	EditManagedMessageArgs,
	EditSentMessageArgs,
	ListMessageArgs,
	MessageManagement,
	SendMessageArgs,
	SentMessage,
} from './types.ts';

import { conversationEvents } from '#features/conversations/events.ts';
import { groupPolicy } from '#features/conversations/groups/policies.ts';
import { conversationPolicy } from '#features/conversations/policies.ts';
import { ForbiddenError, NotFoundError } from '#utils/errors.ts';

import { messageRepository } from './repository.ts';

const send = async ({ userId, conversationId, body }: SendMessageArgs) => {
	const member = await conversationPolicy.requireMembership({ userId, conversationId });

	const data = await messageRepository.create({
		...body,
		senderId: member.userId,
		conversationId: member.conversationId,
	});

	conversationEvents.publish(data.conversationId, { type: 'message_sent', data });

	return data;
};

const find = async ({ userId, conversationId, query }: ListMessageArgs) => {
	const member = await conversationPolicy.requireMembership({ userId, conversationId });
	return messageRepository.find({ conversationId: member.conversationId, query });
};

const getOne = async ({ messageId }: MessageParams) => {
	const message = await messageRepository.findOne({ id: messageId });
	if (message == null) throw new NotFoundError({ resource: 'message' });
	return message;
};

const getOneBySender = async ({ userId, messageId }: SentMessage) => {
	const message = await getOne({ messageId });
	if (message.senderId !== userId) throw new ForbiddenError();
	return message;
};

const edit = async ({ id, ...values }: MessageUpdate) => {
	const data = await messageRepository.update({ ...values, id });
	conversationEvents.publish(data.conversationId, { type: 'message_edited', data });
	return data;
};

const editBySender = async ({ userId, messageId, body }: EditSentMessageArgs) => {
	const { id } = await getOneBySender({ userId, messageId });
	return await edit({ ...body, id });
};

const editWithPermission = async ({
	actorId,
	groupId,
	messageId,
	body,
}: EditManagedMessageArgs) => {
	const { id, senderId } = await getOne({ messageId });
	await groupPolicy.authorizeMemberManagement({ actorId, targetId: senderId, groupId });
	return await edit({ ...body, id });
};

const destroy = async ({ id }: IdArgs) => {
	const data = await messageRepository.destroy({ id });
	conversationEvents.publish(data.conversationId, { type: 'message_deleted', data });
	return data;
};

const destroyBySender = async ({ userId, messageId }: SentMessage) => {
	const { id } = await getOneBySender({ userId, messageId });
	return await destroy({ id });
};

const destroyWithPermission = async ({ actorId, groupId, messageId }: MessageManagement) => {
	const { id, senderId } = await getOne({ messageId });
	await groupPolicy.authorizeMemberManagement({ actorId, targetId: senderId, groupId });
	return await destroy({ id });
};

export const messageService = {
	send,
	find,
	edit: editBySender,
	destroy: destroyBySender,
	editWithPermission,
	destroyWithPermission,
} as const;
