import { defineConfig } from 'drizzle-kit';

import { config } from './src/config/index.ts';

// https://orm.drizzle.team/docs/drizzle-config-file
export default defineConfig({
	dialect: 'postgresql',
	schema: 'src/db/schemas/index.ts',
	dbCredentials: {
		url: config.dbUrl,
	},
});
