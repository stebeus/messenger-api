import { Hono } from 'hono';

import { Query } from '#contracts/dtos.ts';
import { CreateMessageBody } from '#features/messages/contracts/dtos.ts';
import { messageService } from '#features/messages/services.ts';
import { requireAuth, validate } from '#middleware/index.ts';

import { ConversationParams } from './contracts/dtos.ts';

export const conversations = new Hono();

conversations.get(
	'/:conversationId/messages',
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
	validate('param', ConversationParams),
	validate('json', CreateMessageBody),
	requireAuth,
	async (c) => {
		const { user } = c.var.auth;
		const { conversationId } = c.req.valid('param');
		const body = c.req.valid('json');

		const data = await messageService.send({ userId: user.id, conversationId, body });

		return c.json({ data }, 201);
	},
);
