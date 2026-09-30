import type { Message } from '#features/conversations/messages/contracts/entity.ts';

import { createTimestamps, defaultId } from '#utils/test.ts';

type MessageOptions = Partial<Message>;

export const createMessage = ({
	id = defaultId,
	senderId = defaultId,
	conversationId = defaultId,
	content = 'Message',
	...timestamps
}: MessageOptions = {}) =>
	({ ...createTimestamps(timestamps), id, senderId, conversationId, content }) as const;
