import { Hono } from 'hono';
import { describeRoute, resolver } from 'hono-openapi';

import { BadRequestErrorResponse, HttpErrorResponse, Query } from '#contracts/dtos.ts';
import { bans } from '#features/conversations/groups/bans/routes.ts';
import { groupCommands } from '#features/conversations/groups/commands.ts';
import {
	CreateGroupBodyRequest,
	Group,
	GroupParams,
	ListGroupsResponse,
	ListJoinedGroupsResponse,
	UpdateGroupBodyRequest,
} from '#features/conversations/groups/contracts/index.ts';
import { groupQueries } from '#features/conversations/groups/queries.ts';
import { members } from '#features/conversations/members/routes.ts';
import { limitImageSize, requireAuth, validate } from '#middleware/index.ts';

import { messages } from './messages.ts';

export const groups = new Hono();

groups.route('/:groupId/bans', bans);
groups.route('/:groupId/members', members);
groups.route('/:groupId/messages', messages);

groups.get(
	'/',
	describeRoute({
		description: 'Retrieves public groups matching the specified query.',
		tags: ['Groups'],
		responses: {
			200: {
				description: 'Public groups matching the specified query.',
				content: { 'application/json': { schema: resolver(ListGroupsResponse) } },
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
	validate('query', Query),
	requireAuth,
	async (c) => {
		const { user } = c.var.auth;
		const query = c.req.valid('query');

		const data = await groupQueries.find({ userId: user.id, query });

		return c.json({ data });
	},
);

groups.get(
	'/me',
	describeRoute({
		description: 'Retrieves joined groups matching the specified query.',
		tags: ['Groups'],
		responses: {
			200: {
				description: 'Joined groups matching the specified query.',
				content: { 'application/json': { schema: resolver(ListJoinedGroupsResponse) } },
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
	validate('query', Query),
	requireAuth,
	async (c) => {
		const { user } = c.var.auth;
		const query = c.req.valid('query');

		const data = await groupQueries.findByMembership({ userId: user.id, query });

		return c.json({ data });
	},
);

groups.post(
	'/',
	describeRoute({
		description: 'Creates a group.',
		tags: ['Groups'],
		responses: {
			200: {
				description: 'The new group.',
				content: { 'application/json': { schema: resolver(Group) } },
			},
			413: {
				description: 'Avatar file size must not exceed 512 KB.',
				content: { 'application/json': { schema: resolver(HttpErrorResponse) } },
			},
			400: {
				description: 'Invalid body.',
				content: { 'application/json': { schema: resolver(BadRequestErrorResponse) } },
			},
			401: {
				description: 'Authentication is required.',
				content: { 'application/json': { schema: resolver(HttpErrorResponse) } },
			},
		},
	}),
	limitImageSize(),
	validate('form', CreateGroupBodyRequest),
	requireAuth,
	async (c) => {
		const { user } = c.var.auth;
		const body = c.req.valid('form');

		const data = await groupCommands.create({ userId: user.id, body });

		return c.json({ data }, 201);
	},
);

groups.patch(
	'/:groupId',
	describeRoute({
		description: 'Updates an owned group.',
		tags: ['Groups'],
		responses: {
			200: {
				description: 'The updated group.',
				content: { 'application/json': { schema: resolver(Group) } },
			},
			413: {
				description: 'Avatar file size must not exceed 512 KB.',
				content: { 'application/json': { schema: resolver(HttpErrorResponse) } },
			},
			400: {
				description: 'Invalid ID parameter or body.',
				content: { 'application/json': { schema: resolver(BadRequestErrorResponse) } },
			},
			401: {
				description: 'Authentication is required.',
				content: { 'application/json': { schema: resolver(HttpErrorResponse) } },
			},
			404: {
				description: 'Group not found.',
				content: { 'application/json': { schema: resolver(HttpErrorResponse) } },
			},
			403: {
				description: 'Group ownership is required',
				content: { 'application/json': { schema: resolver(HttpErrorResponse) } },
			},
		},
	}),
	limitImageSize(),
	validate('param', GroupParams),
	validate('form', UpdateGroupBodyRequest),
	requireAuth,
	async (c) => {
		const { groupId } = c.req.valid('param');
		const { user } = c.var.auth;
		const body = c.req.valid('form');

		const data = await groupCommands.update({ groupId, userId: user.id, body });

		return c.json({ data });
	},
);

groups.delete(
	'/:groupId',
	describeRoute({
		description: 'Deletes an owned group.',
		tags: ['Groups'],
		responses: {
			200: {
				description: 'The deleted group.',
				content: { 'application/json': { schema: resolver(Group) } },
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
				description: 'Group not found.',
				content: { 'application/json': { schema: resolver(HttpErrorResponse) } },
			},
			403: {
				description: 'Group ownership is required',
				content: { 'application/json': { schema: resolver(HttpErrorResponse) } },
			},
		},
	}),
	validate('param', GroupParams),
	requireAuth,
	async (c) => {
		const { groupId } = c.req.valid('param');
		const { user } = c.var.auth;

		const data = await groupCommands.destroy({ groupId, userId: user.id });

		return c.json({ data });
	},
);
