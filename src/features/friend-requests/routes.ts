import { Hono } from 'hono';

import { UserParams } from '#features/users/contracts/dtos.ts';
import { requireAuth, validate } from '#middleware/index.ts';

import { FriendRequestParams, FriendRequestQuery } from './contracts/dtos.ts';
import { friendRequestRepository } from './repository.ts';
import { friendRequestService } from './services.ts';

export const friendRequests = new Hono();

friendRequests.get('/', validate('query', FriendRequestQuery), requireAuth, async (c) => {
	const { user } = c.var.auth;
	const query = c.req.valid('query');

	const data = await friendRequestRepository.find({ userId: user.id, query });

	return c.json({ data });
});

friendRequests.post(
	'/:recipientId',
	validate('param', FriendRequestParams),
	requireAuth,
	async (c) => {
		const { user } = c.var.auth;
		const { recipientId } = c.req.valid('param');

		const data = await friendRequestService.send({ requesterId: user.id, recipientId });

		return c.json({ data }, 201);
	},
);

friendRequests.delete('/:userId', validate('param', UserParams), requireAuth, async (c) => {
	const { user } = c.var.auth;
	const { userId } = c.req.valid('param');

	const data = await friendRequestService.cancel({ user1Id: user.id, user2Id: userId });

	return c.json({ data });
});
