import { Hono } from 'hono';
import { describeRoute, resolver } from 'hono-openapi';

import { BadRequestErrorResponse, HttpErrorResponse } from '#contracts/dtos.ts';
import { requireAuth, validate } from '#middleware/index.ts';

import { Message, MessageParams, UpdateMessageBodyRequest } from './contracts/index.ts';
import { messageService } from './services.ts';

export const messages = new Hono();

messages.patch(
	'/:messageId',
	describeRoute({
		description: 'Edits the specified sent message.',
		responses: {
			200: {
				description: 'The edited message.',
				content: { 'application/json': { schema: resolver(Message) } },
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
				description: 'Message not found.',
				content: { 'application/json': { schema: resolver(HttpErrorResponse) } },
			},
			403: {
				description: 'You cannot edit messages sent by other users.',
				content: { 'application/json': { schema: resolver(HttpErrorResponse) } },
			},
		},
	}),
	validate('param', MessageParams),
	validate('json', UpdateMessageBodyRequest),
	requireAuth,
	async (c) => {
		const { user } = c.var.auth;
		const { messageId } = c.req.valid('param');
		const body = c.req.valid('json');

		const data = await messageService.edit({ userId: user.id, messageId, body });

		return c.json({ data });
	},
);

messages.delete(
	'/:messageId',
	describeRoute({
		description: 'Deletes the specified sent message.',
		responses: {
			200: {
				description: 'The deleted message.',
				content: { 'application/json': { schema: resolver(Message) } },
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
				description: 'Message not found.',
				content: { 'application/json': { schema: resolver(HttpErrorResponse) } },
			},
			403: {
				description: 'You cannot delete messages sent by other users.',
				content: { 'application/json': { schema: resolver(HttpErrorResponse) } },
			},
		},
	}),
	validate('param', MessageParams),
	requireAuth,
	async (c) => {
		const { user } = c.var.auth;
		const { messageId } = c.req.valid('param');

		const data = await messageService.destroy({ userId: user.id, messageId });

		return c.json({ data });
	},
);
