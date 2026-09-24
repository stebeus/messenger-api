import { serve } from '@hono/node-server';
import { WebSocketServer } from 'ws';

import { app } from './app.ts';
import { config } from './config.ts';

const wss = new WebSocketServer({ noServer: true });

serve({ fetch: app.fetch, port: config.port, websocket: { server: wss } }, ({ port }) =>
	console.log(`Server running on port ${port}`),
);
