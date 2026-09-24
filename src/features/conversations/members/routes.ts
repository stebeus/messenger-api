import { Hono } from 'hono';

import { GroupMemberParams, GroupParams } from '#features/conversations/groups/contracts/dtos.ts';
import { UserQuery } from '#features/users/contracts/dtos.ts';
import { requireAuth, validate } from '#middleware/index.ts';

import { UpdateMemberBody } from './contracts/dtos.ts';
import { memberService } from './services.ts';

export const members = new Hono();

members.get(
	'/',
	validate('param', GroupParams),
	validate('query', UserQuery),
	requireAuth,
	async (c) => {
		const { user } = c.var.auth;
		const { groupId } = c.req.valid('param');
		const query = c.req.valid('query');

		const data = await memberService.find({ userId: user.id, groupId, query });

		return c.json({ data });
	},
);

members.post('/', validate('param', GroupParams), requireAuth, async (c) => {
	const { user } = c.var.auth;
	const { groupId } = c.req.valid('param');

	const data = await memberService.joinGroup({ userId: user.id, groupId });

	return c.json({ data }, 201);
});

members.delete('/me', validate('param', GroupParams), requireAuth, async (c) => {
	const { user } = c.var.auth;
	const { groupId } = c.req.valid('param');

	const data = await memberService.leaveGroup({ userId: user.id, groupId });

	return c.json({ data });
});

members.patch(
	'/:memberId',
	validate('param', GroupMemberParams),
	validate('json', UpdateMemberBody),
	requireAuth,
	async (c) => {
		const { user } = c.var.auth;
		const { groupId, memberId } = c.req.valid('param');
		const { role } = c.req.valid('json');

		const data = await memberService.changeRole({
			actorId: user.id,
			targetId: memberId,
			groupId,
			role,
		});

		return c.json({ data });
	},
);

members.delete('/:memberId', validate('param', GroupMemberParams), requireAuth, async (c) => {
	const { user } = c.var.auth;
	const { groupId, memberId } = c.req.valid('param');

	const data = await memberService.kick({ actorId: user.id, targetId: memberId, groupId });

	return c.json({ data });
});
