import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { WebSocketServer } from 'ws';

import { config } from './config.ts';
import { auth } from './lib/auth.ts';
import { routes } from './routes.ts';
import { HttpError, NotFoundError } from './utils/errors.ts';

const wss = new WebSocketServer({ noServer: true });

export const app = new Hono().basePath('/api');

export const createServer = (port: number) =>
	serve({ fetch: app.fetch, port, websocket: { server: wss } }, ({ port }) =>
		console.log(`Server running on port ${port}`),
	);

app.use(logger());

app.use(
	cors({
		origin: config.app.clientUrl,
		allowMethods: ['GET', 'POST', 'PATCH', 'DELETE'],
		credentials: true,
	}),
);

app.all('/auth/*', (c) => auth.handler(c.req.raw));

app.route('/v1', routes);

app.notFound((c) => {
	const error = new NotFoundError();
	return c.json({ error }, error.status);
});

app.onError((error, c) => {
	const httpError = HttpError.isHttpError(error) ? error : new HttpError();
	if (httpError.status >= 500) console.error(error);
	return c.json({ error: httpError }, httpError.status);
});
