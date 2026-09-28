import { beforeEach, describe, expect, it } from 'vitest';

import { app } from '#app.ts';
import { resetTestDb } from '#db/helpers.ts';
import { groupCommands } from '#features/conversations/groups/commands.ts';
import { groupQueries } from '#features/conversations/groups/queries.ts';
import { memberService } from '#features/conversations/members/services.ts';
import { conversationService } from '#features/conversations/services.ts';
import { createAuthenticatedUser } from '#features/users/tests/factories.ts';
import { maxFileSize } from '#middleware/storage.ts';
import { requestMultipartForm } from '#utils/test.ts';

const url = '/api/v1/groups';

beforeEach(async () => await resetTestDb());

describe('GET /groups', () => {
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

	it('retrieves groups', async () => {
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

describe('GET /groups/me', () => {
	describe('Given invalid query parameters', () => {
		it('rejects unknown query parameters', async () => {
			const res = await app.request(`${url}/me?name=john_doe`);
			expect(res.status).toBe(400);
		});

		it('rejects invalid query values', async () => {
			const res = await app.request(`${url}/me?sort=john_doe`);
			expect(res.status).toBe(400);
		});
	});

	it('rejects unauthenticated users', async () => {
		const res = await app.request(`${url}/me`);
		expect(res.status).toBe(401);
	});

	it('retrieves joined groups', async () => {
		// Arrange
		const { headers } = await createAuthenticatedUser();

		// Act
		const res = await app.request(`${url}/me`, { headers });

		// Assert
		const { data } = await res.json();

		expect(res.status).toBe(200);
		expect(data).toBeInstanceOf(Array);
	});
});

describe('POST /groups', () => {
	it('rejects avatars that exceeds the upload size limit', async () => {
		// Arrange
		const fileSize = (maxFileSize + 1) * 1024;
		const blobPart = new Uint8Array(fileSize);
		const avatar = new File([blobPart], 'test.jpg', { type: 'image/jpeg' });

		// Act
		const res = await requestMultipartForm(app, `${url}`, { name: 'Group', avatar });

		// Assert
		expect(res.status).toBe(413);
	});

	it('rejects invalid bodies', async () => {
		const res = await requestMultipartForm(app, `${url}`, { name: '' });
		expect(res.status).toBe(400);
	});

	it('rejects unauthenticated users', async () => {
		const res = await requestMultipartForm(app, `${url}`, { name: 'Group' });
		expect(res.status).toBe(401);
	});

	it('creates a group', async () => {
		// Arrange
		const { headers, user } = await createAuthenticatedUser();

		// Act
		const res = await requestMultipartForm(app, `${url}`, { name: 'Group' }, { headers });

		// Assert
		const { id } = (await res.json()).data;

		const conversation = await conversationService.getOne({ conversationId: id, userId: user.id });
		const group = await groupQueries.getOneByOwnership({ groupId: id, userId: user.id });
		const owner = await memberService.getOne({ groupId: id, userId: user.id });

		expect(res.status).toBe(201);

		expect(conversation).toBeDefined();
		expect(group).toBeDefined();
		expect(owner).toBeDefined();
	});
});

describe('PATCH /groups/:groupId', () => {
	it('rejects avatars that exceeds the upload size limit', async () => {
		// Arrange
		const fileSize = (maxFileSize + 1) * 1024;
		const blobPart = new Uint8Array(fileSize);
		const avatar = new File([blobPart], 'test.jpg', { type: 'image/jpeg' });

		// Act
		const res = await requestMultipartForm(
			app,
			`${url}/1`,
			{ name: 'Updated', avatar },
			{ method: 'PATCH' },
		);

		// Assert
		expect(res.status).toBe(413);
	});

	describe('Given invalid inputs', () => {
		it('rejects invalid parameters', async () => {
			const res = await requestMultipartForm(
				app,
				`${url}/john_doe`,
				{ name: 'Updated' },
				{ method: 'PATCH' },
			);

			expect(res.status).toBe(400);
		});

		it('rejects invalid bodies', async () => {
			const res = await requestMultipartForm(app, `${url}/1`, { name: '' }, { method: 'PATCH' });
			expect(res.status).toBe(400);
		});
	});

	it('rejects unauthenticated users', async () => {
		const res = await requestMultipartForm(
			app,
			`${url}/1`,
			{ name: 'Updated' },
			{ method: 'PATCH' },
		);

		expect(res.status).toBe(401);
	});

	it('retrieves not found for non-existent groups', async () => {
		// Arrange
		const { headers } = await createAuthenticatedUser();

		// Act
		const res = await requestMultipartForm(
			app,
			`${url}/${Number.MAX_SAFE_INTEGER}`,
			{ name: 'Updated' },
			{ method: 'PATCH', headers },
		);

		// Assert
		expect(res.status).toBe(404);
	});

	it('forbids updating groups from other owners', async () => {
		// Arrange
		const { headers } = await createAuthenticatedUser();
		const { user } = await createAuthenticatedUser();

		const { conversationId } = await groupCommands.create({
			userId: user.id,
			body: { name: 'Group' },
		});

		// Act
		const res = await requestMultipartForm(
			app,
			`${url}/${conversationId}`,
			{ name: 'Updated' },
			{ method: 'PATCH', headers },
		);

		// Assert
		expect(res.status).toBe(403);
	});

	it('updates an owned group', async () => {
		// Arrange
		const { headers, user } = await createAuthenticatedUser();

		const { conversationId } = await groupCommands.create({
			userId: user.id,
			body: { name: 'Group' },
		});

		// Act
		const res = await requestMultipartForm(
			app,
			`${url}/${conversationId}`,
			{ name: 'Updated' },
			{ method: 'PATCH', headers },
		);

		// Assert
		const { data } = await res.json();

		expect(res.status).toBe(200);
		expect(data).toBeDefined();
	});
});

describe('DELETE /groups/:groupId', () => {
	it('rejects invalid parameters', async () => {
		const res = await app.request(`${url}/john_doe`, { method: 'DELETE' });
		expect(res.status).toBe(400);
	});

	it('rejects unauthenticated users', async () => {
		const res = await app.request(`${url}/1`, { method: 'DELETE' });
		expect(res.status).toBe(401);
	});

	it('retrieves not found for non-existent groups', async () => {
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

	it('forbids deleting groups from other owners', async () => {
		// Arrange
		const { headers } = await createAuthenticatedUser();
		const { user } = await createAuthenticatedUser();

		const { conversationId } = await groupCommands.create({
			userId: user.id,
			body: { name: 'Group' },
		});

		// Act
		const res = await app.request(`${url}/${conversationId}`, { method: 'DELETE', headers });

		// Assert
		expect(res.status).toBe(403);
	});

	it('deletes an owned group', async () => {
		// Arrange
		const { headers, user } = await createAuthenticatedUser();

		const { conversationId } = await groupCommands.create({
			userId: user.id,
			body: { name: 'Group' },
		});

		// Act
		const res = await app.request(`${url}/${conversationId}`, { method: 'DELETE', headers });

		// Assert
		const { data } = await res.json();

		expect(res.status).toBe(200);
		expect(data).toBeDefined();
	});
});
