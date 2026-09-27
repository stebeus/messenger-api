import { drizzle } from 'drizzle-orm/postgres-js';

import { config } from '#config.ts';

import { conversationRelations, socialRelations, userRelations } from './relations/index.ts';

const relations = { ...conversationRelations, ...socialRelations, ...userRelations } as const;

export const db = drizzle({
	connection: config.db.url,
	relations,
});

export const testDb = drizzle({
	connection: config.db.url,
	relations,
});
