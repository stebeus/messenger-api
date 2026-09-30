import { Hono } from 'hono';
import { describeRoute, resolver } from 'hono-openapi';

import { BadRequestErrorResponse, HttpErrorResponse } from '#contracts/dtos.ts';
import { BanErrorResponse } from '#features/conversations/groups/bans/contracts/dtos.ts';
import { GroupMemberParams, GroupParams } from '#features/conversations/groups/contracts/dtos.ts';
import { UserQuery } from '#features/users/contracts/dtos.ts';
import { requireAuth, validate } from '#middleware/index.ts';

import { ListMembersResponse, Member, UpdateMemberBodyRequest } from './contracts/index.ts';
import { memberService } from './services.ts';

export const members = new Hono();

members.get(
	'/',
	describeRoute({
		description: 'Retrieves bans matching the specified query.',
		responses: {
			200: {
				description: 'Bans matching the specified query.',
				content: { 'application/json': { schema: resolver(ListMembersResponse) } },
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
				description: 'Membership is required.',
				content: { 'application/json': { schema: resolver(HttpErrorResponse) } },
			},
		},
	}),
	validate('param', GroupParams),
	validate('query', UserQuery),
	requireAuth,
	async (c) => {
		const { user } = c.var.auth;
		const { groupId } = c.req.valid('param');
		const query = c.req.valid('query');

		const data = await memberService.find({ userId: user.id, groupId, query });

		return c.json({ data });
	},
);

members.post(
	'/',
	describeRoute({
		description: 'Joins the specified group.',
		responses: {
			201: {
				description: 'The joined group.',
				content: { 'application/json': { schema: resolver(Member) } },
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
				description: 'You have been banned from this group.',
				content: { 'application/json': { schema: resolver(BanErrorResponse) } },
			},
			409: {
				description: 'Group already joined.',
				content: { 'application/json': { schema: resolver(HttpErrorResponse) } },
			},
		},
	}),
	validate('param', GroupParams),
	requireAuth,
	async (c) => {
		const { user } = c.var.auth;
		const { groupId } = c.req.valid('param');

		const data = await memberService.joinGroup({ userId: user.id, groupId });

		return c.json({ data }, 201);
	},
);

members.delete(
	'/me',
	describeRoute({
		description: 'Leaves the specified group.',
		responses: {
			200: {
				description: 'The exited group.',
				content: { 'application/json': { schema: resolver(Member) } },
			},
			400: {
				description: 'Invalid group ID parameter.',
				content: { 'application/json': { schema: resolver(BadRequestErrorResponse) } },
			},
			401: {
				description: 'Authentication is required.',
				content: { 'application/json': { schema: resolver(HttpErrorResponse) } },
			},
			403: {
				description: 'Owners cannot leave their own groups.',
				content: { 'application/json': { schema: resolver(HttpErrorResponse) } },
			},
		},
	}),
	validate('param', GroupParams),
	requireAuth,
	async (c) => {
		const { user } = c.var.auth;
		const { groupId } = c.req.valid('param');

		const data = await memberService.leaveGroup({ userId: user.id, groupId });

		return c.json({ data });
	},
);

members.patch(
	'/:memberId',
	describeRoute({
		description: 'Changes the specified member role.',
		responses: {
			200: {
				description: 'The updated member.',
				content: { 'application/json': { schema: resolver(Member) } },
			},
			400: {
				description: 'Invalid ID parameters or role.',
				content: { 'application/json': { schema: resolver(BadRequestErrorResponse) } },
			},
			401: {
				description: 'Authentication is required.',
				content: { 'application/json': { schema: resolver(HttpErrorResponse) } },
			},
			404: {
				description: 'Member not found.',
				content: { 'application/json': { schema: resolver(HttpErrorResponse) } },
			},
			403: {
				description: 'You do not have permission to update this member.',
				content: { 'application/json': { schema: resolver(HttpErrorResponse) } },
			},
		},
	}),
	validate('param', GroupMemberParams),
	validate('json', UpdateMemberBodyRequest),
	requireAuth,
	async (c) => {
		const { user } = c.var.auth;
		const { groupId, memberId } = c.req.valid('param');
		const { role } = c.req.valid('json');

		const data = await memberService.changeRole({
			actorId: user.id,
			targetId: memberId,
			groupId,
			role,
		});

		return c.json({ data });
	},
);

members.delete(
	'/:memberId',
	describeRoute({
		description: 'Kicks the specified member.',
		responses: {
			200: {
				description: 'The kicked user.',
				content: { 'application/json': { schema: resolver(Member) } },
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
				description: 'Member not found.',
				content: { 'application/json': { schema: resolver(HttpErrorResponse) } },
			},
			403: {
				description: 'You do not have permission to kick this member.',
				content: { 'application/json': { schema: resolver(HttpErrorResponse) } },
			},
		},
	}),
	validate('param', GroupMemberParams),
	requireAuth,
	async (c) => {
		const { user } = c.var.auth;
		const { groupId, memberId } = c.req.valid('param');

		const data = await memberService.kick({ actorId: user.id, targetId: memberId, groupId });

		return c.json({ data });
	},
);
