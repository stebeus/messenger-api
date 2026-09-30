import { Hono } from 'hono';
import { describeRoute, resolver } from 'hono-openapi';

import { BadRequestErrorResponse, HttpErrorResponse } from '#contracts/dtos.ts';
import { Group, GroupMessageParams } from '#features/conversations/groups/contracts/index.ts';
import { UpdateMessageBodyRequest } from '#features/conversations/messages/contracts/dtos.ts';
import { messageService } from '#features/conversations/messages/index.ts';
import { requireAuth, validate } from '#middleware/index.ts';

export const messages = new Hono();

messages.patch(
	'/:messageId',
	describeRoute({
		description: 'Edits the specified group message.',
		tags: ['Group messages'],
		responses: {
			200: {
				description: 'The edited message.',
				content: { 'application/json': { schema: resolver(Group) } },
			},
			400: {
				description: 'Invalid ID parameters or message content.',
				content: { 'application/json': { schema: resolver(BadRequestErrorResponse) } },
			},
			401: {
				description: 'Authentication is required.',
				content: { 'application/json': { schema: resolver(HttpErrorResponse) } },
			},
			404: {
				description: 'Group message not found.',
				content: { 'application/json': { schema: resolver(HttpErrorResponse) } },
			},
			403: {
				description: 'You do not permission to edit this message.',
				content: { 'application/json': { schema: resolver(HttpErrorResponse) } },
			},
		},
	}),
	validate('param', GroupMessageParams),
	validate('json', UpdateMessageBodyRequest),
	requireAuth,
	async (c) => {
		const { groupId, messageId } = c.req.valid('param');
		const { user } = c.var.auth;
		const body = c.req.valid('json');

		const data = await messageService.editWithPermission({
			actorId: user.id,
			groupId,
			messageId,
			body,
		});

		return c.json({ data });
	},
);

messages.delete(
	'/:messageId',
	describeRoute({
		description: 'Deletes the specified group message.',
		tags: ['Group messages'],
		responses: {
			200: {
				description: 'The deleted message.',
				content: { 'application/json': { schema: resolver(Group) } },
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
				description: 'Group message not found.',
				content: { 'application/json': { schema: resolver(HttpErrorResponse) } },
			},
			403: {
				description: 'You do not permission to delete this message.',
				content: { 'application/json': { schema: resolver(HttpErrorResponse) } },
			},
		},
	}),
	validate('param', GroupMessageParams),
	requireAuth,
	async (c) => {
		const { groupId, messageId } = c.req.valid('param');
		const { user } = c.var.auth;

		const data = await messageService.destroyWithPermission({
			actorId: user.id,
			groupId,
			messageId,
		});

		return c.json({ data });
	},
);
