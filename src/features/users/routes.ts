import { Hono } from 'hono';

import { requireAuth, validate } from '#middleware/index.ts';

import { UserParams, UserQuery } from './contracts/dtos.ts';
import { userRepository } from './repository.ts';
import { userService } from './services.ts';

export const users = new Hono();

users.get('/', validate('query', UserQuery), requireAuth, async (c) => {
	const { user } = c.var.auth;
	const query = c.req.valid('query');

	const data = await userRepository.find({ userId: user.id, query });

	return c.json({ data });
});

users.get('/:userId', validate('param', UserParams), async (c) => {
	const params = c.req.valid('param');
	const data = await userService.getOne(params);
	return c.json({ data });
});
