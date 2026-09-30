import type { BodyArgs, QueryArgs } from '#contracts/dtos.ts';
import type { Selection } from '#db/types.ts';
import type { ConversationParams } from '#features/conversations/contracts/dtos.ts';
import type { Management } from '#features/conversations/groups/types.ts';
import type { MemberArgs } from '#features/conversations/members/types.ts';
import type { UserParams } from '#features/users/contracts/dtos.ts';
import type {
	CreateMessageBodyRequest,
	Message,
	MessageParams,
	UpdateMessageBodyRequest,
} from './contracts/index.ts';

type EditMessageArgs = BodyArgs<UpdateMessageBodyRequest>;

export type MessagesSelection = ConversationParams & QueryArgs;

export type MessageSelection = Selection<Message>;

export type SendMessageArgs = MemberArgs & BodyArgs<CreateMessageBodyRequest>;

export type ListMessageArgs = MemberArgs & QueryArgs;

export type SentMessage = UserParams & MessageParams;

export type EditSentMessageArgs = SentMessage & EditMessageArgs;

export type MessageManagement = Management & MessageParams;

export type EditManagedMessageArgs = MessageManagement & EditMessageArgs;
