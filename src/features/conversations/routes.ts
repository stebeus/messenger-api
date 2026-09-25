import { upgradeWebSocket } from '@hono/node-server';
import { type Context, Hono } from 'hono';

import { Query } from '#contracts/dtos.ts';
import { CreateMessageBody } from '#features/conversations/messages/contracts/dtos.ts';
import { messageService } from '#features/conversations/messages/services.ts';
import { type AuthEnv, requireAuth, validate } from '#middleware/index.ts';

import { ConversationParams } from './contracts/dtos.ts';
import { conversationEvents } from './events.ts';
import { conversationService } from './services.ts';

export const conversations = new Hono();

type ConversationWsContext = Context<
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
	validate('param', ConversationParams),
	requireAuth,
	upgradeWebSocket(async (c: ConversationWsContext) => {
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
