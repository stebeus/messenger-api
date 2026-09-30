import { upgradeWebSocket } from '@hono/node-server';
import { type Context, Hono } from 'hono';
import { describeRoute, resolver } from 'hono-openapi';

import {
	BadRequestErrorResponse,
	ForbiddenErrorResponse,
	Query,
	UnauthorizedErrorResponse,
} from '#contracts/dtos.ts';
import { type AuthEnv, requireAuth, validate } from '#middleware/index.ts';

import { ConversationNotFoundErrorResponse, ConversationParams } from './contracts/dtos.ts';
import { conversationEvents } from './events.ts';
import {
	CreateMessageBodyRequest,
	ListMessagesResponse,
	Message,
} from './messages/contracts/index.ts';
import { messageService } from './messages/services.ts';
import { conversationService } from './services.ts';

export const conversations = new Hono();

type ConversationWebSocketContext = Context<
	AuthEnv,
	'/:conversationId/ws',
	{
		out: {
			param: ConversationParams;
		};
	}
>;

conversations.get(
	'/:conversationId/ws',
	describeRoute({
		description: 'Connects to the specified conversation.',
		tags: ['Conversations'],
		responses: {
			400: {
				description: 'Invalid conversation ID parameter.',
				content: { 'application/json': { schema: resolver(BadRequestErrorResponse) } },
			},
			401: {
				description: 'Authentication is required.',
				content: { 'application/json': { schema: resolver(UnauthorizedErrorResponse) } },
			},
			404: {
				description: 'Conversation not found.',
				content: { 'application/json': { schema: resolver(ConversationNotFoundErrorResponse) } },
			},
		},
	}),
	validate('param', ConversationParams),
	requireAuth,
	upgradeWebSocket(async (c: ConversationWebSocketContext) => {
		const { user } = c.var.auth;
		const { conversationId } = c.req.valid('param');

		const conversation = await conversationService.getOne({ userId: user.id, conversationId });

		let unsubscribe: (() => void) | undefined;

		return {
			onOpen: (_event, ws) => {
				unsubscribe = conversationEvents.subscribe(conversation.id, (event) => {
					const { type, data } = event;
					const payload = JSON.stringify(event);

					if (type === 'conversation.deleted') ws.close(1011, 'Conversation was deleted');

					for (const expulsionType of ['kicked', 'banned']) {
						const expelled =
							type === (`member.${expulsionType}` as const) && data.userId === user.id;

						if (expelled) ws.close(1008, `You have been ${expulsionType} from the group`);
					}

					ws.send(payload);
				});
			},
			onClose: () => unsubscribe?.(),
		};
	}),
);

conversations.get(
	'/:conversationId/messages',
	describeRoute({
		description: 'Retrieves messages matching the specified query.',
		tags: ['Conversations'],
		responses: {
			200: {
				description: 'Messages matching the specified query.',
				content: { 'application/json': { schema: resolver(ListMessagesResponse) } },
			},
			400: {
				description: 'Invalid conversation ID or query parameters.',
				content: { 'application/json': { schema: resolver(BadRequestErrorResponse) } },
			},
			401: {
				description: 'Authentication is required.',
				content: { 'application/json': { schema: resolver(UnauthorizedErrorResponse) } },
			},
			403: {
				description: 'Membership is required.',
				content: { 'application/json': { schema: resolver(ForbiddenErrorResponse) } },
			},
		},
	}),
	validate('param', ConversationParams),
	validate('query', Query),
	requireAuth,
	async (c) => {
		const { user } = c.var.auth;
		const { conversationId } = c.req.valid('param');
		const query = c.req.valid('query');

		const data = await messageService.find({ userId: user.id, conversationId, query });

		return c.json({ data });
	},
);

conversations.post(
	'/:conversationId/messages',
	describeRoute({
		description: 'Sends a message to the specified conversation.',
		tags: ['Conversations'],
		responses: {
			201: {
				description: 'The sent message.',
				content: { 'application/json': { schema: resolver(Message) } },
			},
			400: {
				description: 'Invalid conversation ID parameter or message content.',
				content: { 'application/json': { schema: resolver(BadRequestErrorResponse) } },
			},
			401: {
				description: 'Authentication is required.',
				content: { 'application/json': { schema: resolver(UnauthorizedErrorResponse) } },
			},
			403: {
				description: 'Membership is required.',
				content: { 'application/json': { schema: resolver(ForbiddenErrorResponse) } },
			},
		},
	}),
	validate('param', ConversationParams),
	validate('json', CreateMessageBodyRequest),
	requireAuth,
	async (c) => {
		const { user } = c.var.auth;
		const { conversationId } = c.req.valid('param');
		const body = c.req.valid('json');

		const data = await messageService.send({ userId: user.id, conversationId, body });

		return c.json({ data }, 201);
	},
);
