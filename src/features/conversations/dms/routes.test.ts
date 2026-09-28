import { beforeEach, describe, expect, it } from 'vitest';

import { app } from '#app.ts';
import { resetTestDb } from '#db/helpers.ts';
import { createAuthenticatedUser } from '#features/users/tests/factories.ts';

import { dmService } from './services.ts';

const url = '/api/v1/dms';

beforeEach(async () => await resetTestDb());

describe('GET /dms', () => {
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

	it('retrieves DMs', async () => {
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

describe('GET /dms/:dmId', () => {
	it('rejects unauthenticated users', async () => {
		const res = await app.request(`${url}/1`);
		expect(res.status).toBe(401);
	});

	it('retrieves not found for non-existent DMs', async () => {
		// Arrange
		const { headers } = await createAuthenticatedUser();

		// Act
		const res = await app.request(`${url}/${Number.MAX_SAFE_INTEGER}`, { headers });

		// Assert
		expect(res.status).toBe(404);
	});

	it('retrieves a DM', async () => {
		// Arrange
		const { headers, user } = await createAuthenticatedUser();
		const { user: user2 } = await createAuthenticatedUser();

		const { id } = await dmService.create({ user1Id: user.id, user2Id: user2.id });

		// Act
		const res = await app.request(`${url}/${id}`, { headers });

		// Assert
		const { data } = await res.json();

		expect(res.status).toBe(200);
		expect(data).toBeDefined();
	});
});
