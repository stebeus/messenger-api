import { Hono } from 'hono';

import { UserQuery } from '#features/users/contracts/dtos.ts';
import { requireAuth, validate } from '#middleware/index.ts';

import { DirectMessageParams } from './dtos.ts';
import { dmRepository } from './repository.ts';
import { dmService } from './services.ts';

export const dms = new Hono();

dms.get('/', validate('query', UserQuery), requireAuth, async (c) => {
	const { user } = c.var.auth;
	const query = c.req.valid('query');

	const data = await dmRepository.find({ userId: user.id, query });

	return c.json({ data });
});

dms.get('/:dmId', validate('param', DirectMessageParams), requireAuth, async (c) => {
	const { dmId } = c.req.valid('param');
	const { user } = c.var.auth;

	const data = await dmService.getOne({ dmId, userId: user.id });

	return c.json({ data });
});
