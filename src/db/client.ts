import { drizzle } from 'drizzle-orm/postgres-js';

import { env } from '#env.ts';

import { messagingRelations, socialRelations, userRelations } from './relations/index.ts';

export const db = drizzle({
	connection: env.DATABASE_URL,
	relations: { ...socialRelations, ...messagingRelations, ...userRelations },
});
