import { Hono } from 'hono';
import { describeRoute, resolver } from 'hono-openapi';

import { BadRequestErrorResponse, HttpErrorResponse } from '#contracts/dtos.ts';
import { GroupMemberParams, GroupParams } from '#features/conversations/groups/contracts/dtos.ts';
import { UserQuery } from '#features/users/contracts/dtos.ts';
import { requireAuth, validate } from '#middleware/index.ts';

import {
	Ban,
	CreateBanBodyRequest,
	ListBansResponse,
	UpdateBanBodyRequest,
} from './contracts/index.ts';
import { banService } from './services.ts';

export const bans = new Hono();

bans.get(
	'/',
	describeRoute({
		description: 'Retrieves bans matching the specified query.',
		tags: ['Bans'],
		responses: {
			200: {
				description: 'Bans matching the specified query.',
				content: { 'application/json': { schema: resolver(ListBansResponse) } },
			},
			400: {
				description: 'Invalid group ID or query parameters.',
				content: { 'application/json': { schema: resolver(BadRequestErrorResponse) } },
			},
			401: {
				description: 'Authentication is required.',
				content: { 'application/json': { schema: resolver(HttpErrorResponse) } },
			},
			403: {
				description: 'You do not have permission to view bans.',
				content: { 'application/json': { schema: resolver(HttpErrorResponse) } },
			},
		},
	}),
	validate('param', GroupParams),
	validate('query', UserQuery),
	requireAuth,
	async (c) => {
		const { groupId } = c.req.valid('param');
		const { user } = c.var.auth;
		const query = c.req.valid('query');

		const data = await banService.find({ groupId, userId: user.id, query });

		return c.json({ data });
	},
);

bans.post(
	'/:memberId',
	describeRoute({
		description: 'Bans the specified group member.',
		tags: ['Bans'],
		responses: {
			201: {
				description: 'The banned user.',
				content: { 'application/json': { schema: resolver(Ban) } },
			},
			400: {
				description: 'Invalid ID parameters or body.',
				content: { 'application/json': { schema: resolver(BadRequestErrorResponse) } },
			},
			401: {
				description: 'Authentication is required.',
				content: { 'application/json': { schema: resolver(HttpErrorResponse) } },
			},
			409: {
				description: 'User is already banned.',
				content: { 'application/json': { schema: resolver(HttpErrorResponse) } },
			},
			404: {
				description: 'Ban not found',
				content: { 'application/json': { schema: resolver(HttpErrorResponse) } },
			},
			403: {
				description: 'You do not have permission to ban this member.',
				content: { 'application/json': { schema: resolver(HttpErrorResponse) } },
			},
		},
	}),
	validate('param', GroupMemberParams),
	validate('json', CreateBanBodyRequest),
	requireAuth,
	async (c) => {
		const { user } = c.var.auth;
		const { groupId, memberId } = c.req.valid('param');
		const body = c.req.valid('json');

		const data = await banService.create({ actorId: user.id, targetId: memberId, groupId, body });

		return c.json({ data }, 201);
	},
);

bans.patch(
	'/:memberId',
	describeRoute({
		description: 'Updates the specified ban.',
		tags: ['Bans'],
		responses: {
			201: {
				description: 'The updated ban.',
				content: { 'application/json': { schema: resolver(Ban) } },
			},
			400: {
				description: 'Invalid ID parameters or body.',
				content: { 'application/json': { schema: resolver(BadRequestErrorResponse) } },
			},
			401: {
				description: 'Authentication is required.',
				content: { 'application/json': { schema: resolver(HttpErrorResponse) } },
			},
			404: {
				description: 'Ban not found',
				content: { 'application/json': { schema: resolver(HttpErrorResponse) } },
			},
			403: {
				description: 'You do not have permission to update this ban.',
				content: { 'application/json': { schema: resolver(HttpErrorResponse) } },
			},
		},
	}),
	validate('param', GroupMemberParams),
	validate('json', UpdateBanBodyRequest),
	requireAuth,
	async (c) => {
		const { user } = c.var.auth;
		const { groupId, memberId } = c.req.valid('param');
		const body = c.req.valid('json');

		const data = await banService.update({ actorId: user.id, targetId: memberId, groupId, body });

		return c.json({ data });
	},
);

bans.delete(
	'/:memberId',
	describeRoute({
		description: 'Unbans the specified user.',
		tags: ['Bans'],
		responses: {
			201: {
				description: 'The unbanned user.',
				content: { 'application/json': { schema: resolver(Ban) } },
			},
			400: {
				description: 'Invalid ID parameters.',
				content: { 'application/json': { schema: resolver(BadRequestErrorResponse) } },
			},
			401: {
				description: 'Authentication is required.',
				content: { 'application/json': { schema: resolver(HttpErrorResponse) } },
			},
			404: {
				description: 'Ban not found',
				content: { 'application/json': { schema: resolver(HttpErrorResponse) } },
			},
			403: {
				description: 'You do not have permission to unban this user.',
				content: { 'application/json': { schema: resolver(HttpErrorResponse) } },
			},
		},
	}),
	validate('param', GroupMemberParams),
	requireAuth,
	async (c) => {
		const { user } = c.var.auth;
		const { groupId, memberId } = c.req.valid('param');

		const data = await banService.destroy({ actorId: user.id, targetId: memberId, groupId });

		return c.json({ data });
	},
);
