import type { IdArgs } from '#contracts/entity.ts';
import type { DatabaseContext } from '#db/types.ts';

import { conversationEvents } from './events.ts';
import { conversationRepository } from './repository.ts';

const purge = async ({ id, tx }: DatabaseContext<IdArgs>) => {
	const data = await conversationRepository.purge({ id, tx });
	conversationEvents.publish(id, { type: 'conversation_deleted', data });
	return data;
};

export const conversationService = { purge } as const;
