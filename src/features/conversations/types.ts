import type { Selection } from '#db/types.ts';
import type { UserParams } from '#features/users/contracts/dtos.ts';
import type { Conversation } from './contracts/entity.ts';

export type ConversationSelection = Selection<Conversation>;

export type ConversationMember = Pick<Conversation, 'id'> & UserParams;
