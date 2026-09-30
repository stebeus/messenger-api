import { serve } from '@hono/node-server';
import { Scalar } from '@scalar/hono-api-reference';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { openAPIRouteHandler } from 'hono-openapi';
import { WebSocketServer } from 'ws';

import pkg from '#root/package.json' with { type: 'json' };

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

app.get(
	'/openapi.json',
	openAPIRouteHandler(app, {
		documentation: {
			info: {
				title: 'Messenger API',
				version: pkg.version,
				license: {
					name: pkg.license,
					identifier: pkg.license,
					url: 'https://opensource.org/license/mit',
				},
			},
			servers: [{ url: config.app.url }],
			tags: [
				{
					name: 'Users',
					description: 'Operations for searching users.',
				},
				{
					name: 'Friend requests',
					description: 'Operations for managing friend requests.',
				},
				{
					name: 'Friends',
					description: 'Operations for managing friendships.',
				},
				{
					name: 'Conversations',
					description: 'Operations for connecting to chat rooms and accessing messages.',
				},
				{
					name: 'Direct messages',
					description: 'Operations for searching direct messages (DMs).',
				},
				{
					name: 'Groups',
					description: 'Operations for managing groups.',
				},
				{
					name: 'Members',
					description: 'Operations for managing conversation membership.',
				},
				{
					name: 'Messages',
					description: 'Operations for editing and deleting your messages.',
				},
				{
					name: 'Group messages',
					description: 'Operations for editing and deleting group messages.',
				},
				{
					name: 'Bans',
					description: 'Operations for managing group bans.',
				},
			],
			// @ts-expect-error Hono OpenAPI doesn't expose the Scalar's `x-tagGroups` extension
			'x-tagGroups': [
				{
					name: 'Social',
					tags: ['Users', 'Friend requests', 'Friends'],
				},
				{
					name: 'Messaging',
					tags: [
						'Conversations',
						'Direct messages',
						'Groups',
						'Members',
						'Messages',
						'Group messages',
						'Bans',
					],
				},
			],
		},
	}),
);

app.get('/scalar', Scalar({ url: '/api/openapi.json' }));

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
