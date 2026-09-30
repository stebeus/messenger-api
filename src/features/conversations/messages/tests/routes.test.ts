import { beforeEach, describe, expect, it } from 'vitest';

import { app } from '#app.ts';
import { resetTestDb } from '#db/helpers.ts';
import { dmService } from '#features/conversations/dms/services.ts';
import { groupCommands } from '#features/conversations/groups/commands.ts';
import { messageService } from '#features/conversations/messages/services.ts';
import { createAuthenticatedUser } from '#features/users/tests/factories.ts';
import { requestJson } from '#utils/test.ts';

const url = '/api/v1/messages';

beforeEach(async () => await resetTestDb());

describe('PATCH /messages/:messageId', () => {
	describe('Given invalid inputs', () => {
		it('rejects invalid parameters', async () => {
			const res = await requestJson(
				app,
				`${url}/john_doe`,
				{ content: 'Edited' },
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
		const res = await requestJson(app, `${url}/1`, { content: 'Edited' }, { method: 'PATCH' });
		expect(res.status).toBe(401);
	});

	it('retrieves not found for unsent messages', async () => {
		// Arrange
		const { headers } = await createAuthenticatedUser();

		// Act
		const res = await requestJson(
			app,
			`${url}/${Number.MAX_SAFE_INTEGER}`,
			{ content: 'Edited' },
			{ method: 'PATCH', headers },
		);

		// Assert
		expect(res.status).toBe(404);
	});

	it('forbids editing messages sent by other users', async () => {
		// Arrange
		const { user, headers } = await createAuthenticatedUser();
		const { user: user2 } = await createAuthenticatedUser();
		const dm = await dmService.create({ user1Id: user.id, user2Id: user2.id });

		const { id } = await messageService.send({
			userId: user2.id,
			conversationId: dm.id,
			body: { content: 'Hello, world!' },
		});

		// Act
		const res = await requestJson(
			app,
			`${url}/${id}`,
			{ content: 'Edited' },
			{ method: 'PATCH', headers },
		);

		// Assert
		expect(res.status).toBe(403);
	});

	it('edits sent messages', async () => {
		// Arrange
		const { user, headers } = await createAuthenticatedUser();

		const { conversationId } = await groupCommands.create({
			userId: user.id,
			body: { name: 'Group' },
		});

		const { id } = await messageService.send({
			userId: user.id,
			conversationId,
			body: { content: 'Hello, world!' },
		});

		// Act
		const res = await requestJson(
			app,
			`${url}/${id}`,
			{ content: 'Edited' },
			{ method: 'PATCH', headers },
		);

		// Assert
		const { data } = await res.json();

		expect(res.status).toBe(200);
		expect(data).toBeDefined();
	});
});

describe('DELETE /messages/:messageId', () => {
	it('rejects invalid parameters', async () => {
		const res = await app.request(`${url}/john_doe`, { method: 'DELETE' });
		expect(res.status).toBe(400);
	});

	it('rejects unauthenticated users', async () => {
		const res = await app.request(`${url}/1`, { method: 'DELETE' });
		expect(res.status).toBe(401);
	});

	it('retrieves not found for non-existent messages', async () => {
		// Arrange
		const { headers } = await createAuthenticatedUser();

		// Act
		const res = await app.request(`${url}/${Number.MAX_SAFE_INTEGER}`, {
			method: 'DELETE',
			headers,
		});

		// Assert
		expect(res.status).toBe(404);
	});

	it('forbids deleting messages sent by other users', async () => {
		// Arrange
		const { headers, user } = await createAuthenticatedUser();
		const { user: user2 } = await createAuthenticatedUser();
		const dm = await dmService.create({ user1Id: user.id, user2Id: user2.id });

		const { id } = await messageService.send({
			userId: user2.id,
			conversationId: dm.id,
			body: { content: 'Hello, world!' },
		});

		// Act
		const res = await app.request(`${url}/${id}`, { method: 'DELETE', headers });

		// Assert
		expect(res.status).toBe(403);
	});

	it('deletes sent messages', async () => {
		// Arrange
		const { user, headers } = await createAuthenticatedUser();

		const { conversationId } = await groupCommands.create({
			userId: user.id,
			body: { name: 'Group' },
		});

		const { id } = await messageService.send({
			userId: user.id,
			conversationId,
			body: { content: 'Hello, world!' },
		});

		// Act
		const res = await app.request(`${url}/${id}`, { method: 'DELETE', headers });

		// Assert
		const { data } = await res.json();

		expect(res.status).toBe(200);
		expect(data).toBeDefined();
	});
});
