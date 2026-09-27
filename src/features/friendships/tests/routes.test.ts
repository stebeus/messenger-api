import { beforeEach, describe, expect, it } from 'vitest';

import { app } from '#app.ts';
import { resetTestDb } from '#db/helpers.ts';
import { dmRepository, dmService } from '#features/conversations/dms/index.ts';
import { friendRequestRepository, friendRequestService } from '#features/friend-requests/index.ts';
import { friendshipService } from '#features/friendships/services.ts';
import { createAuthenticatedUser } from '#features/users/tests/factories.ts';

const url = '/api/v1/friends';

beforeEach(async () => await resetTestDb());

describe('GET /friends', () => {
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

	it('retrieves friends', async () => {
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

describe('POST /friends/:requesterId', () => {
	it('rejects invalid parameters', async () => {
		const res = await app.request(`${url}/john_doe`, { method: 'POST' });
		expect(res.status).toBe(400);
	});

	it('rejects unauthenticated users', async () => {
		const res = await app.request(`${url}/2`, { method: 'POST' });
		expect(res.status).toBe(401);
	});

	it('retrieves not found for non-existent friend requests', async () => {
		// Arrange
		const { headers } = await createAuthenticatedUser();

		// Act
		const res = await app.request(`${url}/${Number.MAX_SAFE_INTEGER}`, { method: 'POST', headers });

		// Assert
		expect(res.status).toBe(404);
	});

	it('accepts friend requests', async () => {
		// Arrange
		const { user } = await createAuthenticatedUser();
		const { headers, user: user2 } = await createAuthenticatedUser();

		await friendRequestService.send({ requesterId: user.id, recipientId: user2.id });

		// Act
		const res = await app.request(`${url}/${user.id}`, { method: 'POST', headers });

		// Assert
		const friendRequest = await friendRequestRepository.findOne({
			user1Id: user.id,
			user2Id: user2.id,
		});

		const dm = await dmService.getOneByPair({ user1Id: user.id, user2Id: user2.id });
		const friendship = await friendshipService.getOne({ user1Id: user.id, user2Id: user2.id });

		expect(res.status).toBe(201);

		expect(friendRequest).toBeUndefined();
		expect(dm).toBeDefined();
		expect(friendship).toBeDefined();
	});
});

describe('DELETE /friends/:friendId', () => {
	it('rejects invalid parameters', async () => {
		const res = await app.request(`${url}/john_doe`, { method: 'DELETE' });
		expect(res.status).toBe(400);
	});

	it('rejects unauthenticated users', async () => {
		const res = await app.request(`${url}/2`, { method: 'DELETE' });
		expect(res.status).toBe(401);
	});

	it('retrieves not found for non-existent friends', async () => {
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

	it('unfriends users', async () => {
		// Arrange
		const { headers, user } = await createAuthenticatedUser();
		const { user: user2 } = await createAuthenticatedUser();

		await friendshipService.create({ user1Id: user.id, user2Id: user2.id });
		await dmService.create({ user1Id: user.id, user2Id: user2.id });

		// Act
		const res = await app.request(`${url}/${user2.id}`, { method: 'DELETE', headers });

		// Assert
		const friendship = await friendshipService.findOne({ user1Id: user.id, user2Id: user2.id });
		const dm = await dmRepository.findOneByPair({ user1Id: user.id, user2Id: user2.id });

		expect(res.status).toBe(200);

		expect(friendship).toBeUndefined();
		expect(dm).toBeUndefined();
	});
});
