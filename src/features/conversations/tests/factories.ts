import { Conversation } from '#features/conversations/contracts/entity.ts';
import { createTimestamp, defaultId } from '#utils/test.ts';

type ConversationOptions = Partial<Conversation>;

const { defaultValue: defaultType } = Conversation.shape.type.def;

export const createConversation = ({
	id = defaultId,
	type = defaultType,
	createdAt,
}: ConversationOptions = {}) => ({ id, type, createdAt: createTimestamp(createdAt) }) as const;
