import { Hono } from 'hono';
import { describeRoute, resolver } from 'hono-openapi';

import { BadRequestErrorResponse, HttpErrorResponse } from '#contracts/dtos.ts';
import { requireAuth, validate } from '#middleware/index.ts';

import { GetUserResponse, ListUsersResponse, UserParams, UserQuery } from './contracts/dtos.ts';
import { userRepository } from './repository.ts';
import { userService } from './services.ts';

export const users = new Hono();

users.get(
	'/',
	describeRoute({
		description: 'Retrieves users matching the specified query.',
		responses: {
			200: {
				description: 'Users matching the specified query.',
				content: { 'application/json': { schema: resolver(ListUsersResponse) } },
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

		const data = await userRepository.find({ userId: user.id, query });

		return c.json({ data });
	},
);

users.get(
	'/:userId',
	describeRoute({
		description: 'Retrieves the specified user.',
		responses: {
			200: {
				description: 'Specified user.',
				content: { 'application/json': { schema: resolver(GetUserResponse) } },
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
				description: 'User not found.',
				content: { 'application/json': { schema: resolver(HttpErrorResponse) } },
			},
		},
	}),
	validate('param', UserParams),
	requireAuth,
	async (c) => {
		const { userId } = c.req.valid('param');
		const data = await userService.getOne({ userId });
		return c.json({ data });
	},
);
