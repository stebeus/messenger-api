import { Hono } from 'hono';

import { GroupMemberParams, GroupParams } from '#features/conversations/groups/contracts/dtos.ts';
import { UserQuery } from '#features/users/contracts/dtos.ts';
import { requireAuth, validate } from '#middleware/index.ts';

import { CreateBanBody, UpdateBanBody } from './contracts/dtos.ts';
import { banService } from './services.ts';

export const bans = new Hono();

bans.get(
	'/',
	validate('param', GroupParams),
	validate('query', UserQuery),
	requireAuth,
	async (c) => {
		const { groupId } = c.req.valid('param');
		const { user } = c.var.auth;
		const query = c.req.valid('query');

		const data = await banService.find({ groupId, userId: user.id, query });

		return c.json({ data });
	},
);

bans.post(
	'/:memberId',
	validate('param', GroupMemberParams),
	validate('json', CreateBanBody),
	requireAuth,
	async (c) => {
		const { user } = c.var.auth;
		const { groupId, memberId } = c.req.valid('param');
		const body = c.req.valid('json');

		const data = await banService.create({
			...body,
			actorId: user.id,
			targetId: memberId,
			groupId,
		});

		return c.json({ data }, 201);
	},
);

bans.patch(
	'/:memberId',
	validate('param', GroupMemberParams),
	validate('json', UpdateBanBody),
	requireAuth,
	async (c) => {
		const { user } = c.var.auth;
		const { groupId, memberId } = c.req.valid('param');
		const body = c.req.valid('json');

		const data = await banService.update({
			...body,
			actorId: user.id,
			targetId: memberId,
			groupId,
		});

		return c.json({ data });
	},
);

bans.delete('/:memberId', validate('param', GroupMemberParams), requireAuth, async (c) => {
	const { user } = c.var.auth;
	const { groupId, memberId } = c.req.valid('param');

	const data = await banService.purge({ actorId: user.id, targetId: memberId, groupId });

	return c.json({ data });
});
