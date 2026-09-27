import { beforeEach, describe, expect, it } from 'vitest';

import { app } from '#app.ts';
import { resetTestDb } from '#db/helpers.ts';

import { createAuthenticatedUser } from './factories.ts';

const url = '/api/v1/users';

beforeEach(async () => await resetTestDb());

describe('GET /users', () => {
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

	it('retrieves users', async () => {
		// Arrange
		const { headers } = await createAuthenticatedUser();

		// Act
		const res = await app.request(url, { headers });
		const { data } = await res.json();

		// Assert
		expect(res.status).toBe(200);
		expect(data).toBeInstanceOf(Array);
	});
});

describe('GET /users/:userId', () => {
	it('rejects unauthenticated users', async () => {
		const res = await app.request(`${url}/1`);
		expect(res.status).toBe(401);
	});

	it('retrieves users', async () => {
		// Arrange
		const { headers } = await createAuthenticatedUser();

		// Act
		const res = await app.request(`${url}/1`, { headers });
		const { data } = await res.json();

		// Assert
		expect(res.status).toBe(200);
		expect(data).toBeDefined();
	});
});
