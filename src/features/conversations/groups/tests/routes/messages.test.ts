import type { User } from 'better-auth';

import { beforeEach, describe, expect, it } from 'vitest';

import { app } from '#app.ts';
import { type GroupSetup, setUpGroup } from '#features/conversations/groups/tests/setup.ts';
import { memberService } from '#features/conversations/members/services.ts';
import { messageService } from '#features/conversations/messages/services.ts';
import { createAuthenticatedUser } from '#features/users/tests/factories.ts';
import { requestJson } from '#utils/test.ts';

let groupSetup: GroupSetup;

let owner: User;
let ownerHeaders: Headers;

let admin: User;
let adminHeaders: Headers;

let member: User;
let memberHeaders: Headers;

let groupId: string;
let url: `/api/v1/groups/${string}/messages`;

beforeEach(async () => {
	groupSetup = await setUpGroup();
	({ owner, ownerHeaders, admin, adminHeaders, member, memberHeaders, groupId } = groupSetup);
	url = `/api/v1/groups/${groupId}/messages`;
});

describe('PATCH /groups/:groupId/messages/:messageId', () => {
	describe('Given invalid inputs', () => {
		it('rejects invalid parameters', async () => {
			const res = await requestJson(
				app,
				`${url}/john_doe`,
				{ content: 'Edited by a manager' },
				{ method: 'PATCH' },
			);

			expect(res.status).toBe(400);
		});

		it('rejects invalid bodies', async () => {
			const res = await requestJson(app, `${url}/1`, { content: null }, { method: 'PATCH' });
			expect(res.status).toBe(400);
		});
	});

	it('rejects unauthenticated users', async () => {
		const res = await requestJson(
			app,
			`${url}/1`,
			{ content: 'Edited by a manager' },
			{ method: 'PATCH' },
		);

		expect(res.status).toBe(401);
	});

	it('retrieves not found for non-existent messages', async () => {
		const res = await requestJson(
			app,
			`${url}/${Number.MAX_SAFE_INTEGER}`,
			{ content: 'Edited by a manager' },
			{ method: 'PATCH', headers: adminHeaders },
		);

		expect(res.status).toBe(404);
	});

	describe('Given unauthorized message edits', () => {
		it('forbids members from editing messages of other members', async () => {
			// Arrange
			const { user } = await createAuthenticatedUser();

			await memberService.joinGroup({ userId: user.id, groupId });

			const { id } = await messageService.send({
				userId: user.id,
				conversationId: groupId,
				body: { content: 'Hello, world!' },
			});

			// Act
			const res = await requestJson(
				app,
				`${url}/${id}`,
				{ content: 'Edited by a manager' },
				{ method: 'PATCH', headers: memberHeaders },
			);

			// Assert
			expect(res.status).toBe(403);
		});

		it('forbids managers from editing messages of managers of the same role', async () => {
			// Arrange
			await memberService.changeRole({
				actorId: admin.id,
				targetId: member.id,
				groupId,
				role: 'admin',
			});

			const { id } = await messageService.send({
				userId: member.id,
				conversationId: groupId,
				body: { content: 'Hello, world!' },
			});

			// Act
			const res = await requestJson(
				app,
				`${url}/${id}`,
				{ content: 'Edited by a manager' },
				{ method: 'PATCH', headers: adminHeaders },
			);

			// Assert
			expect(res.status).toBe(403);
		});

		it('forbids managers from editing messages of managers of a superior role', async () => {
			// Arrange
			const { id } = await messageService.send({
				userId: owner.id,
				conversationId: groupId,
				body: { content: 'Hello, world!' },
			});

			// Act
			const res = await requestJson(
				app,
				`${url}/${id}`,
				{ content: 'Edited by a manager' },
				{ method: 'PATCH', headers: adminHeaders },
			);

			// Assert
			expect(res.status).toBe(403);
		});
	});

	it('edits messages from other members', async () => {
		// Arrange
		const { id } = await messageService.send({
			userId: admin.id,
			conversationId: groupId,
			body: { content: 'Destroy the owner guys' },
		});

		// Act
		const res = await requestJson(
			app,
			`${url}/${id}`,
			{ content: 'Destroy me guys' },
			{ method: 'PATCH', headers: ownerHeaders },
		);

		// Assert
		expect(res.status).toBe(200);
	});
});

describe('DELETE /groups/:groupId/messages/:messageId', () => {
	it('rejects invalid parameters', async () => {
		const res = await app.request(`${url}/john_doe`, { method: 'DELETE' });
		expect(res.status).toBe(400);
	});

	it('rejects unauthenticated users', async () => {
		const res = await app.request(`${url}/1`, { method: 'DELETE' });
		expect(res.status).toBe(401);
	});

	it('retrieves not found for non-existent messages', async () => {
		const res = await app.request(`${url}/${Number.MAX_SAFE_INTEGER}`, {
			method: 'DELETE',
			headers: adminHeaders,
		});

		expect(res.status).toBe(404);
	});

	describe('Given unauthorized message deletions', () => {
		it('forbids members from deleting messages of other members', async () => {
			// Arrange
			const { user } = await createAuthenticatedUser();
			await memberService.joinGroup({ userId: user.id, groupId });

			const { id } = await messageService.send({
				userId: user.id,
				conversationId: groupId,
				body: { content: 'Hello, world!' },
			});

			// Act
			const res = await app.request(`${url}/${id}`, {
				method: 'DELETE',
				headers: memberHeaders,
			});

			// Assert
			expect(res.status).toBe(403);
		});

		it('forbids managers from deleting messages of managers of the same role', async () => {
			// Arrange
			await memberService.changeRole({
				actorId: admin.id,
				targetId: member.id,
				groupId,
				role: 'admin',
			});

			const { id } = await messageService.send({
				userId: member.id,
				conversationId: groupId,
				body: { content: 'Hello, world!' },
			});

			// Act
			const res = await app.request(`${url}/${id}`, {
				method: 'DELETE',
				headers: adminHeaders,
			});

			// Assert
			expect(res.status).toBe(403);
		});

		it('forbids managers from deleting messages of managers of a superior role', async () => {
			// Arrange
			const { id } = await messageService.send({
				userId: owner.id,
				conversationId: groupId,
				body: { content: 'Hello, world!' },
			});

			// Act
			const res = await app.request(`${url}/${id}`, {
				method: 'DELETE',
				headers: adminHeaders,
			});

			// Assert
			expect(res.status).toBe(403);
		});
	});

	it('deletes messages from other members', async () => {
		// Arrange
		const { id } = await messageService.send({
			userId: admin.id,
			conversationId: groupId,
			body: { content: 'I hate the owner' },
		});

		// Act
		const res = await app.request(`${url}/${id}`, {
			method: 'DELETE',
			headers: ownerHeaders,
		});

		// Assert
		expect(res.status).toBe(200);
	});
});
