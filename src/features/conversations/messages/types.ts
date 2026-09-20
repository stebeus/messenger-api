import type { BodyDto, QueryDto } from '#contracts/dtos.ts';
import type { Selection } from '#db/types.ts';
import type { ConversationParams } from '#features/conversations/contracts/dtos.ts';
import type { Management, MemberArgs } from '#features/conversations/members/types.ts';
import type { UserParams } from '#features/users/contracts/dtos.ts';
import type {
	CreateMessageBody,
	Message,
	MessageParams,
	UpdateMessageBody,
} from './contracts/index.ts';

type UpdateMessageDto = BodyDto<UpdateMessageBody>;

export type MessagesSelection = ConversationParams & QueryDto;

export type MessageSelection = Selection<Message>;

export type ListMessageArgs = MemberArgs & QueryDto;

export type SendMessageArgs = MemberArgs & BodyDto<CreateMessageBody>;

export type SentMessage = UserParams & MessageParams;

export type EditMessageArgs = SentMessage & UpdateMessageDto;

export type MessageManagement = Management & MessageParams;

export type EditManagedMessageArgs = MessageManagement & UpdateMessageDto;
