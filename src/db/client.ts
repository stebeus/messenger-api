import { drizzle } from 'drizzle-orm/postgres-js';

import { config } from '#config/index.ts';

import { conversationRelations, socialRelations, userRelations } from './relations/index.ts';

export const db = drizzle({
	connection: config.dbUrl,
	relations: { ...conversationRelations, ...socialRelations, ...userRelations },
});
