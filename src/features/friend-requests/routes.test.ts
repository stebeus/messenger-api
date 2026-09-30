import { beforeEach, describe, expect, it } from 'vitest';

import { app } from '#app.ts';
import { resetDb } from '#db/helpers.ts';
import { friendshipService } from '#features/friendships/services.ts';
import { createAuthenticatedUser } from '#features/users/tests/factories.ts';

import { friendRequestService } from './services.ts';

const url = '/api/v1/friend-requests';

beforeEach(async () => await resetDb());

describe('GET /friend-requests', () => {
	describe('Given invalid query parameters', () => {
		it('rejects unknown query parameters', async () => {
			const res = await app.request(`${url}?name=john_doe`);
			expect(res.status).toBe(400);
		});

		it('rejects invalid query values', async () => {
			const res = await app.request(`${url}?sort=john_doe`);
			expect(res.status).toBe(400);
		});
	});

	it('rejects unauthenticated users', async () => {
		const res = await app.request(url);
		expect(res.status).toBe(401);
	});

	it('retrieves friend requests', async () => {
		// Arrange
		const { headers } = await createAuthenticatedUser();

		// Act
		const res = await app.request(url, { headers });

		// Assert
		const { data } = await res.json();

		expect(res.status).toBe(200);
		expect(data).toBeInstanceOf(Array);
	});
});

describe('POST /friend-requests/:recipientId', () => {
	it('rejects invalid parameters', async () => {
		const res = await app.request(`${url}/john_doe`, { method: 'POST' });
		expect(res.status).toBe(400);
	});

	it('rejects unauthenticated users', async () => {
		const res = await app.request(`${url}/2`, { method: 'POST' });
		expect(res.status).toBe(401);
	});

	it('retrieves not found for non-existent users', async () => {
		// Arrange
		const { headers } = await createAuthenticatedUser();

		// Act
		const res = await app.request(`${url}/${Number.MAX_SAFE_INTEGER}`, { method: 'POST', headers });

		// Assert
		expect(res.status).toBe(404);
	});

	it('rejects self friend requests', async () => {
		// Arrange
		const { headers, user } = await createAuthenticatedUser();

		// Act
		const res = await app.request(`${url}/${user.id}`, { method: 'POST', headers });

		// assert
		expect(res.status).toBe(422);
	});

	describe('Given existing resources', () => {
		it('prevents duplicating friend requests', async () => {
			// Arrange
			const { headers } = await createAuthenticatedUser();
			const { user } = await createAuthenticatedUser();

			await app.request(`${url}/${user.id}`, { method: 'POST', headers });

			// Act
			const res = await app.request(`${url}/${user.id}`, { method: 'POST', headers });

			// Assert
			expect(res.status).toBe(409);
		});

		it('prevents requesting existing friends', async () => {
			// Arrange
			const { headers, user } = await createAuthenticatedUser();
			const { user: user2 } = await createAuthenticatedUser();

			await friendshipService.create({ user1Id: user.id, user2Id: user2.id });

			// Act
			const res = await app.request(`${url}/${user2.id}`, { method: 'POST', headers });

			// Assert
			expect(res.status).toBe(409);
		});
	});

	it('sends friend requests', async () => {
		// Arrange
		const { headers } = await createAuthenticatedUser();
		const { user } = await createAuthenticatedUser();

		// Act
		const res = await app.request(`${url}/${user.id}`, { method: 'POST', headers });

		// Assert
		const { data } = await res.json();

		expect(res.status).toBe(201);
		expect(data).toBeDefined();
	});
});

describe('DELETE /friend-requests/:userId', () => {
	it('rejects invalid parameters', async () => {
		const res = await app.request(`${url}/john_doe`, { method: 'DELETE' });
		expect(res.status).toBe(400);
	});

	it('rejects unauthenticated users', async () => {
		const res = await app.request(`${url}/2`, { method: 'DELETE' });
		expect(res.status).toBe(401);
	});

	it('retrieves not found for non-existent friend requests', async () => {
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

	it('cancels friend requests', async () => {
		// Arrange
		const { user } = await createAuthenticatedUser();
		const { headers, user: user2 } = await createAuthenticatedUser();

		await friendRequestService.send({ requesterId: user.id, recipientId: user2.id });

		// Act
		const res = await app.request(`${url}/${user.id}`, { method: 'DELETE', headers });

		// Assert
		const { data } = await res.json();

		expect(res.status).toBe(200);
		expect(data).toBeDefined();
	});
});
