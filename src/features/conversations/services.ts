import type { IdArgs } from '#contracts/entity.ts';
import type { DatabaseContext } from '#db/types.ts';
import type { ConversationParams } from './contracts/dtos.ts';

import { NotFoundError } from '#utils/errors.ts';

import { conversationEvents } from './events.ts';
import { conversationRepository } from './repository.ts';

const getOne = async ({ conversationId }: ConversationParams) => {
	const conversation = await conversationRepository.findOne({ id: conversationId });
	if (conversation == null) throw new NotFoundError({ resource: 'conversation' });
	return conversation;
};

const destroy = async ({ id, tx }: DatabaseContext<IdArgs>) => {
	const data = await conversationRepository.destroy({ id, tx });
	conversationEvents.publish(id, { type: 'conversation_deleted', data });
	return data;
};

export const conversationService = { getOne, destroy } as const;
