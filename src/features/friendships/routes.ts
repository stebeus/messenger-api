import { Hono } from 'hono';

import { friendRequestService } from '#features/friend-requests/services.ts';
import { UserQuery } from '#features/users/contracts/dtos.ts';
import { requireAuth, validate } from '#middleware/index.ts';

import { CreateFriendParams, FriendParams } from './contracts/dtos.ts';
import { friendshipService } from './services.ts';

export const friends = new Hono();

friends.get('/', validate('query', UserQuery), requireAuth, async (c) => {
	const { user } = c.var.auth;
	const query = c.req.valid('query');

	const data = await friendshipService.find({ userId: user.id, query });

	return c.json({ data });
});

friends.post('/:requesterId', validate('param', CreateFriendParams), requireAuth, async (c) => {
	const { user } = c.var.auth;
	const { requesterId } = c.req.valid('param');

	const data = await friendRequestService.accept({ recipientId: user.id, requesterId });

	return c.json({ data }, 201);
});

friends.delete('/:friendId', validate('param', FriendParams), requireAuth, async (c) => {
	const { user } = c.var.auth;
	const { friendId } = c.req.valid('param');

	const data = await friendshipService.unfriend({ user1Id: user.id, user2Id: friendId });

	return c.json({ data });
});
