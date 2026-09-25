import type { Selection } from '#db/types.ts';
import type { UserParams } from '#features/users/contracts/dtos.ts';
import type { Conversation, ConversationParams } from './contracts/index.ts';

export type ConversationSelection = Selection<Conversation>;

export type ConversationMember = ConversationParams & UserParams;

export type ParticipatedConversation = ConversationSelection & UserParams;
