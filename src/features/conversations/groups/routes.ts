import { Hono } from 'hono';

import { Query } from '#contracts/dtos.ts';
import { members } from '#features/conversations/members/routes.ts';
import { UpdateMessageBody } from '#features/conversations/messages/contracts/dtos.ts';
import { messageService } from '#features/conversations/messages/index.ts';
import { limitImageSize, requireAuth, validate } from '#middleware/index.ts';

import { bans } from './bans/routes.ts';
import { groupService } from './commands.ts';
import {
	CreateGroupBody,
	GroupMessageParams,
	GroupParams,
	UpdateGroupBody,
} from './contracts/dtos.ts';
import { groupRepository } from './repository.ts';

export const groups = new Hono();

groups.route('/:groupId/members', members);
groups.route('/:groupId/bans', bans);

groups.get('/', validate('query', Query), requireAuth, async (c) => {
	const { user } = c.var.auth;
	const query = c.req.valid('query');

	const data = await groupRepository.find({ userId: user.id, query });

	return c.json({ data });
});

groups.get('/me', validate('query', Query), requireAuth, async (c) => {
	const { user } = c.var.auth;
	const query = c.req.valid('query');

	const data = await groupRepository.findByMembership({ userId: user.id, query });

	return c.json({ data });
});

groups.post('/', limitImageSize(), validate('form', CreateGroupBody), requireAuth, async (c) => {
	const { user } = c.var.auth;
	const body = c.req.valid('form');

	const data = await groupService.create({ userId: user.id, body });

	return c.json({ data }, 201);
});

groups.patch(
	'/:groupId',
	limitImageSize(),
	validate('param', GroupParams),
	validate('form', UpdateGroupBody),
	requireAuth,
	async (c) => {
		const { groupId } = c.req.valid('param');
		const { user } = c.var.auth;
		const body = c.req.valid('form');

		const data = await groupService.update({ groupId, userId: user.id, body });

		return c.json({ data });
	},
);

groups.delete('/:groupId', validate('param', GroupParams), requireAuth, async (c) => {
	const { groupId } = c.req.valid('param');
	const { user } = c.var.auth;

	const data = await groupService.destroy({ groupId, userId: user.id });

	return c.json({ data });
});

groups.patch(
	'/:groupId/messages/:messageId',
	validate('param', GroupMessageParams),
	validate('json', UpdateMessageBody),
	requireAuth,
	async (c) => {
		const { groupId, messageId } = c.req.valid('param');
		const { user } = c.var.auth;
		const body = c.req.valid('json');

		const data = await messageService.editWithPermission({
			actorId: user.id,
			groupId,
			messageId,
			body,
		});

		return c.json({ data });
	},
);

groups.delete(
	'/:groupId/messages/:messageId',
	validate('param', GroupMessageParams),
	requireAuth,
	async (c) => {
		const { groupId, messageId } = c.req.valid('param');
		const { user } = c.var.auth;

		const data = await messageService.destroyWithPermission({
			actorId: user.id,
			groupId,
			messageId,
		});

		return c.json({ data });
	},
);
