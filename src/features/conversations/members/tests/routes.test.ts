import type { User } from 'better-auth';

import { beforeEach, describe, expect, it } from 'vitest';

import { app } from '#app.ts';
import { banService } from '#features/conversations/groups/bans/services.ts';
import { type GroupSetup, setUpGroup } from '#features/conversations/groups/tests/setup.ts';
import { memberService } from '#features/conversations/members/services.ts';
import { createAuthenticatedUser } from '#features/users/tests/factories.ts';
import { requestJson } from '#utils/test.ts';

let setup: GroupSetup;

let owner: User;
let ownerHeaders: Headers;

let admin: User;
let adminHeaders: Headers;

let member: User;
let memberHeaders: Headers;

let groupId: string;
let url: `/api/v1/groups/${string}/members`;

beforeEach(async () => {
	setup = await setUpGroup();
	({ owner, ownerHeaders, admin, adminHeaders, member, memberHeaders, groupId } = setup);
	url = `/api/v1/groups/${groupId}/members`;
});

describe('GET /groups/:groupId/members', () => {
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

	it('forbids nonmembers', async () => {
		// Arrange
		const { headers } = await createAuthenticatedUser();

		// Act
		const res = await app.request(url, { headers });

		// Assert
		expect(res.status).toBe(403);
	});

	it('retrieves members', async () => {
		const res = await app.request(url, { headers: memberHeaders });
		const { data } = await res.json();

		expect(res.status).toBe(200);
		expect(data).toBeInstanceOf(Array);
	});
});

describe('POST /groups/:groupId/members', () => {
	it('rejects unauthenticated users', async () => {
		const res = await app.request(url, { method: 'POST' });
		expect(res.status).toBe(401);
	});

	it('forbids banned users from joining the group', async () => {
		// Arrange
		await banService.create({
			actorId: admin.id,
			targetId: member.id,
			groupId,
			body: { reason: 'Test' },
		});

		// Act
		const res = await app.request(url, { method: 'POST', headers: memberHeaders });

		// Assert
		expect(res.status).toBe(403);
	});

	it('prevents duplicating members', async () => {
		// Arrange
		await app.request(url, { method: 'POST', headers: memberHeaders });

		// Act
		const res = await app.request(url, { method: 'POST', headers: memberHeaders });

		// Assert
		expect(res.status).toBe(409);
	});

	it('allows users to join the group', async () => {
		// Arrange
		const { headers } = await createAuthenticatedUser();

		// Act
		const res = await app.request(url, { method: 'POST', headers });

		// Assert
		const { data } = await res.json();

		expect(res.status).toBe(201);
		expect(data).toBeDefined();
	});

	it('allows users with expired bans to join the group', async () => {
		// Arrange
		await banService.create({
			actorId: admin.id,
			targetId: member.id,
			groupId,
			body: { reason: 'Test', expiresAt: new Date() },
		});

		// Act
		const res = await app.request(url, { method: 'POST', headers: memberHeaders });

		// Assert
		const { data } = await res.json();

		expect(res.status).toBe(201);
		expect(data).toBeDefined();
	});
});

describe('DELETE /groups/:groupId/members/me', () => {
	it('rejects unauthenticated users', async () => {
		const res = await app.request(`${url}/me`, { method: 'DELETE' });
		expect(res.status).toBe(401);
	});

	it('forbids owners from leaving their groups', async () => {
		const res = await app.request(`${url}/me`, { method: 'DELETE', headers: ownerHeaders });
		expect(res.status).toBe(403);
	});

	it('allows members to leave the group', async () => {
		const res = await app.request(`${url}/me`, { method: 'DELETE', headers: memberHeaders });
		const { data } = await res.json();

		expect(res.status).toBe(200);
		expect(data).toBeDefined();
	});
});

describe('PATCH /groups/:groupId/members/:memberId', () => {
	describe('Given invalid inputs', () => {
		it('rejects invalid parameters', async () => {
			const res = await requestJson(app, `${url}/john_doe`, { role: 'admin' }, { method: 'PATCH' });
			expect(res.status).toBe(400);
		});

		it('rejects invalid roles', async () => {
			const res = await requestJson(app, `${url}/1`, { role: 'moderator' }, { method: 'PATCH' });
			expect(res.status).toBe(400);
		});
	});

	it('rejects unauthenticated users', async () => {
		const res = await requestJson(app, `${url}/1`, { role: 'admin' }, { method: 'PATCH' });
		expect(res.status).toBe(401);
	});

	it('retrieves not found for non-existent members', async () => {
		const res = await requestJson(
			app,
			`${url}/${Number.MAX_SAFE_INTEGER}`,
			{ role: 'admin' },
			{ method: 'PATCH', headers: adminHeaders },
		);

		expect(res.status).toBe(404);
	});

	describe('Given unauthorized member updates', () => {
		it('forbids members from updating other members', async () => {
			// Arrange
			const { user } = await createAuthenticatedUser();
			await memberService.joinGroup({ userId: user.id, groupId });

			// Act
			const res = await requestJson(
				app,
				`${url}/${user.id}`,
				{ role: 'admin' },
				{ method: 'PATCH', headers: memberHeaders },
			);

			// Assert
			expect(res.status).toBe(403);
		});

		it('forbids managers from updating managers of the same role', async () => {
			// Arrange
			await requestJson(
				app,
				`${url}/${member.id}`,
				{ role: 'admin' },
				{ method: 'PATCH', headers: adminHeaders },
			);

			// Act
			const res = await requestJson(
				app,
				`${url}/${member.id}`,
				{ role: 'admin' },
				{ method: 'PATCH', headers: adminHeaders },
			);

			// Assert
			expect(res.status).toBe(403);
		});

		it('forbids managers from banning managers with a superior role', async () => {
			const res = await requestJson(
				app,
				`${url}/${owner.id}`,
				{ role: 'member' },
				{ method: 'PATCH', headers: adminHeaders },
			);

			expect(res.status).toBe(403);
		});
	});

	it('changes the member role', async () => {
		const res = await requestJson(
			app,
			`${url}/${admin.id}`,
			{ role: 'member' },
			{ method: 'PATCH', headers: ownerHeaders },
		);

		const { data } = await res.json();

		expect(res.status).toBe(200);
		expect(data).toBeDefined();
	});
});

describe('DELETE /groups/:groupId/members/:memberId', () => {
	it('rejects invalid parameters', async () => {
		const res = await app.request(`${url}/john_doe`, { method: 'DELETE' });
		expect(res.status).toBe(400);
	});

	it('rejects unauthenticated users', async () => {
		const res = await app.request(`${url}/1`, { method: 'DELETE' });
		expect(res.status).toBe(401);
	});

	it('retrieves not found for non-existent members', async () => {
		const res = await app.request(`${url}/${Number.MAX_SAFE_INTEGER}`, {
			method: 'DELETE',
			headers: adminHeaders,
		});

		expect(res.status).toBe(404);
	});

	describe('Given unauthorized kicks', () => {
		it('forbids members from kicking other members', async () => {
			// Arrange
			const { user } = await createAuthenticatedUser();
			await memberService.joinGroup({ userId: user.id, groupId });

			// Act
			const res = await app.request(`${url}/${user.id}`, {
				method: 'DELETE',
				headers: memberHeaders,
			});

			// Assert
			expect(res.status).toBe(403);
		});

		it('forbids managers from kicking managers of the same role', async () => {
			// Arrange
			await requestJson(
				app,
				`${url}/${member.id}`,
				{ role: 'admin' },
				{ method: 'PATCH', headers: adminHeaders },
			);

			// Act
			const res = await app.request(`${url}/${member.id}`, {
				method: 'DELETE',
				headers: adminHeaders,
			});

			// Assert
			expect(res.status).toBe(403);
		});

		it('forbids managers from kicking managers with a superior role', async () => {
			const res = await app.request(`${url}/${owner.id}`, {
				method: 'DELETE',
				headers: adminHeaders,
			});

			expect(res.status).toBe(403);
		});
	});

	it('kicks a member', async () => {
		const res = await app.request(`${url}/${admin.id}`, {
			method: 'DELETE',
			headers: ownerHeaders,
		});

		const { data } = await res.json();

		expect(res.status).toBe(200);
		expect(data).toBeDefined();
	});
});
