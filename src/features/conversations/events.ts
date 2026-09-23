import type { Id } from '#contracts/entities.ts';
import type { Ban } from '#features/bans/contracts/entity.ts';
import type { Member } from '#features/members/contracts/entity.ts';
import type { Message } from '#features/messages/contracts/entity.ts';
import type { Conversation } from './contracts/entity.ts';
import type { Group } from './groups/contracts/entity.ts';

import EventEmitter from 'node:events';

type Events = {
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

type Event<Domain extends keyof Events, Type extends keyof Events[Domain]> = {
	type: `${Domain}_${Type & string}`;
	data: Events[Domain][Type];
};

type DomainEvent<Domain extends keyof Events> = {
	[Type in keyof Events[Domain]]: Event<Domain, Type>;
}[keyof Events[Domain]];

type ConversationEvent = {
	[Domain in keyof Events]: DomainEvent<Domain>;
}[keyof Events];

type ConversationEventMap = {
	[key: string]: [event: ConversationEvent];
};

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
