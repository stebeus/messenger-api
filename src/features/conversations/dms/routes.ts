import { Hono } from 'hono';
import { describeRoute, resolver } from 'hono-openapi';

import { BadRequestErrorResponse, HttpErrorResponse } from '#contracts/dtos.ts';
import { UserQuery } from '#features/users/contracts/dtos.ts';
import { requireAuth, validate } from '#middleware/index.ts';

import { DirectMessageParams, ListDirectMessagesResponse } from './dtos.ts';
import { dmRepository } from './repository.ts';
import { dmService } from './services.ts';

export const dms = new Hono();

dms.get(
	'/',
	describeRoute({
		description:
			'Retrieves DMs involving users matching the specified username or display name, with optional sorting.',
		responses: {
			200: {
				description: 'DMs matching the specified query.',
				content: { 'application/json': { schema: resolver(ListDirectMessagesResponse) } },
			},
			400: {
				description: 'Invalid query parameters.',
				content: { 'application/json': { schema: resolver(BadRequestErrorResponse) } },
			},
			401: {
				description: 'Authentication is required.',
				content: { 'application/json': { schema: resolver(HttpErrorResponse) } },
			},
		},
	}),
	validate('query', UserQuery),
	requireAuth,
	async (c) => {
		const { user } = c.var.auth;
		const query = c.req.valid('query');

		const data = await dmRepository.find({ userId: user.id, query });

		return c.json({ data });
	},
);

dms.get(
	'/:dmId',
	describeRoute({
		description: 'Retrieves the specified DM',
		responses: {
			200: {
				description: 'The specified DM.',
				content: { 'application/json': { schema: resolver(ListDirectMessagesResponse) } },
			},
			400: {
				description: 'Invalid ID parameter.',
				content: { 'application/json': { schema: resolver(BadRequestErrorResponse) } },
			},
			401: {
				description: 'Authentication is required.',
				content: { 'application/json': { schema: resolver(HttpErrorResponse) } },
			},
			404: {
				description: 'DM not found.',
				content: { 'application/json': { schema: resolver(HttpErrorResponse) } },
			},
		},
	}),
	validate('param', DirectMessageParams),
	requireAuth,
	async (c) => {
		const { dmId } = c.req.valid('param');
		const { user } = c.var.auth;

		const data = await dmService.getOne({ dmId, userId: user.id });

		return c.json({ data });
	},
);
