import { Hono } from 'hono';

import { validate } from '#middleware/validator.ts';

import { UserParams, UserQuery } from './contracts/dtos.ts';
import { userRepository } from './repository.ts';
import { userService } from './services.ts';

export const users = new Hono();

users.get('/', validate('query', UserQuery), async (c) => {
	const query = c.req.valid('query');
	const data = await userRepository.find({ query });
	return c.json({ data });
});

users.get('/:userId', validate('param', UserParams), async (c) => {
	const params = c.req.valid('param');
	const data = await userService.getOne(params);
	return c.json({ data });
});
