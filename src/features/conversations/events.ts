import type { Id } from '#contracts/entity.ts';
import type { EventMap, EventValues } from '#types.ts';
import type { Conversation } from './contracts/entity.ts';
import type { Ban } from './groups/bans/contracts/entity.ts';
import type { Group } from './groups/contracts/entity.ts';
import type { Member } from './members/contracts/entity.ts';
import type { Message } from './messages/contracts/entity.ts';

import EventEmitter from 'node:events';

type ConversationEvents = {
	conversation: {
		deleted: Conversation;
	};
	group: {
		updated: Group;
	};
	member: {
		joined: Member;
		left: Member;
		updated: Member;
		kicked: Member;
		banned: Ban;
		unbanned: Ban;
	};
	message: {
		sent: Message;
		edited: Message;
		deleted: Message;
	};
};

type ConversationEvent = EventValues<ConversationEvents>;

type ConversationEventMap = EventMap<ConversationEvent>;

const events = new EventEmitter<ConversationEventMap>();

const nameEvent = (id: Id) => `conversation:${id}`;

const publish = (id: Id, event: ConversationEvent) => {
	const conversation = nameEvent(id);
	events.emit(conversation, event);
};

const subscribe = (id: Id, listener: (event: ConversationEvent) => void) => {
	const conversation = nameEvent(id);
	events.on(conversation, listener);
	return () => events.off(conversation, listener);
};

export const conversationEvents = { publish, subscribe } as const;
