import { beforeEach, describe, expect, it } from 'vitest';

import { app } from '#app.ts';
import { resetTestDb } from '#db/helpers.ts';
import { groupCommands } from '#features/conversations/groups/commands.ts';
import { createAuthenticatedUser } from '#features/users/tests/factories.ts';
import { requestJson } from '#utils/test.ts';

const url = '/api/v1/conversations';

beforeEach(async () => await resetTestDb());

describe('GET /conversations/:conversationId/messages', () => {
	describe('Given invalid inputs', () => {
		it('rejects invalid parameters', async () => {
			const res = await app.request(`${url}/john_doe/messages`);
			expect(res.status).toBe(400);
		});

		it('rejects unknown query parameters', async () => {
			const res = await app.request(`${url}/1/messages?name=john_doe`);
			expect(res.status).toBe(400);
		});

		it('rejects invalid query values', async () => {
			const res = await app.request(`${url}/1/messages?sort=john_doe`);
			expect(res.status).toBe(400);
		});
	});

	it('rejects unauthenticated users', async () => {
		const res = await app.request(`${url}/1/messages`);
		expect(res.status).toBe(401);
	});

	it('forbids nonmembers', async () => {
		// Arrange
		const { headers } = await createAuthenticatedUser();
		const { user } = await createAuthenticatedUser();

		const { conversationId } = await groupCommands.create({
			userId: user.id,
			body: { name: 'Group' },
		});

		// Act
		const res = await app.request(`${url}/${conversationId}/messages`, { headers });

		// Assert
		expect(res.status).toBe(403);
	});

	it('retrieves messages', async () => {
		// Arrange
		const { user, headers } = await createAuthenticatedUser();

		const { conversationId } = await groupCommands.create({
			userId: user.id,
			body: { name: 'Group' },
		});

		// Act
		const res = await app.request(`${url}/${conversationId}/messages`, { headers });

		// Assert
		const { data } = await res.json();

		expect(res.status).toBe(200);
		expect(data).toBeInstanceOf(Array);
	});
});

describe('POST /conversations/:conversationId/messages', () => {
	describe('Given invalid inputs', () => {
		it('rejects invalid parameters', async () => {
			const res = await requestJson(app, `${url}/john_doe/messages`, { content: 'Hello, world!' });
			expect(res.status).toBe(400);
		});

		it('rejects invalid bodies', async () => {
			// Arrange
			const { headers } = await createAuthenticatedUser();

			// Act
			const res = await requestJson(app, `${url}/1/messages`, { content: null }, { headers });

			// Assert
			expect(res.status).toBe(400);
		});
	});

	it('rejects unauthenticated users', async () => {
		const res = await requestJson(app, `${url}/1/messages`, { content: 'Hello, world!' });
		expect(res.status).toBe(401);
	});

	it('forbids nonmembers', async () => {
		// Arrange
		const { headers } = await createAuthenticatedUser();
		const { user } = await createAuthenticatedUser();

		const { conversationId } = await groupCommands.create({
			userId: user.id,
			body: { name: 'Group' },
		});

		// Act
		const res = await requestJson(
			app,
			`${url}/${conversationId}/messages`,
			{ content: 'Hello, world!' },
			{ headers },
		);

		// Assert
		expect(res.status).toBe(403);
	});

	it('sends messages', async () => {
		// Arrange
		const { user, headers } = await createAuthenticatedUser();

		const { conversationId } = await groupCommands.create({
			userId: user.id,
			body: { name: 'Group' },
		});

		// Act
		const res = await requestJson(
			app,
			`${url}/${conversationId}/messages`,
			{ content: 'Hello, world!' },
			{ headers },
		);

		// Assert
		expect(res.status).toBe(201);
	});
});
