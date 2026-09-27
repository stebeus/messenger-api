import type { Id } from '#contracts/entity.ts';

import { sql } from 'drizzle-orm';

import { testDb } from './client.ts';

export const contains = (query?: string) =>
	query == null ? undefined : ({ like: `%${query}%` } as const);

export const exclude = (id: Id) => ({ NOT: { id } }) as const;

export const orderBy = (sort = 'createdAt', order = 'asc') =>
	({ orderBy: { [sort]: order } }) as const;

export const parseId = (id: Id) => {
	const parsedId = Number.parseInt(id, 10);
	if (Number.isNaN(parsedId)) throw new Error('Parsed ID is NaN');
	return parsedId;
};

export const resetTestDb = async () => {
	await testDb.execute(sql`
		DO $$ 
		DECLARE 
			r RECORD;
		BEGIN 
			FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP 
				EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE;'; 
			END LOOP; 
		END $$;
	`);
};
