import { serve } from '@hono/node-server';

import { app } from './app.ts';
import { config } from './config/index.ts';

serve({ fetch: app.fetch, port: config.port }, ({ port }) =>
	console.log(`Server running on port ${port}`),
);
