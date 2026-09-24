import { Hono } from 'hono';

import { requireAuth, validate } from '#middleware/index.ts';

import { MessageParams, UpdateMessageBody } from './contracts/dtos.ts';
import { messageService } from './services.ts';

export const messages = new Hono();

messages.patch(
	'/:messageId',
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

messages.delete('/:messageId', validate('param', MessageParams), requireAuth, async (c) => {
	const { user } = c.var.auth;
	const { messageId } = c.req.valid('param');

	const data = await messageService.purge({ userId: user.id, messageId });

	return c.json({ data });
});
