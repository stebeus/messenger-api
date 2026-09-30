import { defineConfig } from 'drizzle-kit';

import { config } from './src/config.ts';

export const configureDrizzle = (url: string) =>
	defineConfig({
		dbCredentials: { url },
		dialect: 'postgresql',
		schema: 'src/db/schemas/index.ts',
	});

// https://orm.drizzle.team/docs/drizzle-config-file
export default configureDrizzle(config.db.url);
