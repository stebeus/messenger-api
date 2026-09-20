import { Hono } from 'hono';

import { Query } from '#contracts/dtos.ts';
import { ConversationParams } from '#features/conversations/contracts/dtos.ts';
import { requireAuth, validate } from '#middleware/index.ts';

import { CreateMessageBody, MessageParams, UpdateMessageBody } from './contracts/dtos.ts';
import { messageService } from './services.ts';

export const messages = new Hono();

messages.get(
	'/conversations/:conversationId/messages',
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

messages.post(
	'/conversations/:conversationId/messages',
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

messages.patch(
	'/messages/:messageId',
	validate('param', MessageParams),
	validate('json', UpdateMessageBody),
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
	'/messages/:messageId',
	validate('param', MessageParams),
	requireAuth,
	async (c) => {
		const { user } = c.var.auth;
		const { messageId } = c.req.valid('param');

		const data = await messageService.destroy({ userId: user.id, messageId });

		return c.json({ data });
	},
);
