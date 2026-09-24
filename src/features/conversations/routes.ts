import { upgradeWebSocket } from '@hono/node-server';
import { Hono } from 'hono';

import { Query } from '#contracts/dtos.ts';
import { CreateMessageBody } from '#features/conversations/messages/contracts/dtos.ts';
import { messageService } from '#features/conversations/messages/services.ts';
import { requireAuth, validate } from '#middleware/index.ts';
import { BadRequestError } from '#utils/errors.ts';

import { ConversationParams } from './contracts/dtos.ts';
import { conversationEvents } from './events.ts';
import { conversationService } from './services.ts';

export const conversations = new Hono();

conversations.get(
	'/:conversationId/ws',
	upgradeWebSocket(async (c) => {
		const { success, data } = ConversationParams.safeParse({
			conversationId: c.req.param('conversationId'),
		});

		if (!success) throw new BadRequestError({ message: 'Invalid conversation ID' });

		const { id } = await conversationService.getOne(data);

		let unsubscribe: (() => void) | undefined;

		return {
			onOpen: (_event, ws) => {
				unsubscribe = conversationEvents.subscribe(id, (event) => {
					const data = JSON.stringify(event);
					ws.send(data);
				});
			},
			onClose: () => unsubscribe?.(),
		};
	}),
);

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
