type Event<Events, Domain extends keyof Events, Type extends keyof Events[Domain]> = {
	type: `${Domain & string}_${Type & string}`;
	data: Events[Domain][Type];
};

type DomainEvent<Events, Domain extends keyof Events> = {
	[Type in keyof Events[Domain]]: Event<Events, Domain, Type>;
}[keyof Events[Domain]];

export type EventValues<Events> = {
	[Domain in keyof Events]: DomainEvent<Events, Domain>;
}[keyof Events];

export type EventMap<Event> = {
	[key: string]: [event: Event];
};
