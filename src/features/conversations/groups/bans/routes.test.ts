import type { User } from 'better-auth';

import { beforeEach, describe, expect, it } from 'vitest';

import { app } from '#app.ts';
import { resetTestDb } from '#db/helpers.ts';
import { groupCommands } from '#features/conversations/groups/commands.ts';
import { memberRepository, memberService } from '#features/conversations/members/index.ts';
import { createAuthenticatedUser } from '#features/users/tests/factories.ts';
import { requestJson } from '#utils/test.ts';

import { banService } from './services.ts';

let owner: User;
let ownerHeaders: Headers;

let admin: User;
let adminHeaders: Headers;

let member: User;
let memberHeaders: Headers;

let groupId: string;
let url: `/api/v1/groups/${string}/bans`;

beforeEach(async () => {
	await resetTestDb();

	const ownerAuth = await createAuthenticatedUser();
	const adminAuth = await createAuthenticatedUser();
	const memberAuth = await createAuthenticatedUser();

	owner = ownerAuth.user;
	ownerHeaders = ownerAuth.headers;

	admin = adminAuth.user;
	adminHeaders = adminAuth.headers;

	member = memberAuth.user;
	memberHeaders = memberAuth.headers;

	const { conversationId } = await groupCommands.create({
		userId: owner.id,
		body: { name: 'Group' },
	});

	groupId = conversationId;
	url = `/api/v1/groups/${groupId}/bans`;

	await memberService.joinGroup({ userId: admin.id, groupId });
	await memberService.joinGroup({ userId: member.id, groupId });

	await memberService.changeRole({ actorId: owner.id, targetId: admin.id, groupId, role: 'admin' });
});

describe('GET /groups/:groupId/bans', () => {
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

	it('forbids non-managers', async () => {
		const res = await app.request(url, { headers: memberHeaders });
		expect(res.status).toBe(403);
	});

	it('retrieves bans', async () => {
		const res = await app.request(url, { headers: adminHeaders });
		const { data } = await res.json();

		expect(res.status).toBe(200);
		expect(data).toBeInstanceOf(Array);
	});
});

describe('POST /groups/:groupId/bans/:memberId', () => {
	describe('Given invalid inputs', () => {
		it('rejects invalid parameters', async () => {
			const res = await requestJson(app, `${url}/john_doe`, { reason: 'Test' });
			expect(res.status).toBe(400);
		});

		it('rejects invalid bodies', async () => {
			const res = await requestJson(app, `${url}/1`, { reason: null });
			expect(res.status).toBe(400);
		});
	});

	it('rejects unauthenticated users', async () => {
		const res = await requestJson(app, `${url}/1`, { reason: 'Test' });
		expect(res.status).toBe(401);
	});

	it('prevents duplicating bans', async () => {
		// Arrange
		await requestJson(app, `${url}/${member.id}`, { reason: 'Test' }, { headers: adminHeaders });

		// Act
		const res = await requestJson(
			app,
			`${url}/${member.id}`,
			{ reason: 'Test' },
			{ headers: adminHeaders },
		);

		// Assert
		expect(res.status).toBe(409);
	});

	it('retrieves not found for non-existent members', async () => {
		const res = await requestJson(
			app,
			`${url}/${Number.MAX_SAFE_INTEGER}`,
			{ reason: 'Test' },
			{ headers: adminHeaders },
		);

		expect(res.status).toBe(404);
	});

	describe('Given unauthorized ban attempts', () => {
		it('forbids members from banning other members', async () => {
			// Arrange
			const { user } = await createAuthenticatedUser();
			await memberService.joinGroup({ userId: user.id, groupId });

			// Act
			const res = await requestJson(
				app,
				`${url}/${user.id}`,
				{ reason: 'Test' },
				{ headers: memberHeaders },
			);

			// Assert
			expect(res.status).toBe(403);
		});

		it('forbids managers from banning managers of the same role', async () => {
			// Arrange
			await memberService.changeRole({
				actorId: admin.id,
				targetId: member.id,
				groupId,
				role: 'admin',
			});

			// Act
			const res = await requestJson(
				app,
				`${url}/${member.id}`,
				{ reason: 'Test' },
				{ headers: adminHeaders },
			);

			// Assert
			expect(res.status).toBe(403);
		});

		it('forbids managers from banning managers with a superior role', async () => {
			const res = await requestJson(
				app,
				`${url}/${owner.id}`,
				{ reason: 'Test' },
				{ headers: adminHeaders },
			);

			expect(res.status).toBe(403);
		});
	});

	it('bans a member', async () => {
		const res = await requestJson(
			app,
			`${url}/${admin.id}`,
			{ reason: 'Treason' },
			{ headers: ownerHeaders },
		);

		const member = await memberRepository.findOne({ userId: admin.id, conversationId: groupId });
		const ban = await banService.getOne({ userId: admin.id, groupId });

		expect(res.status).toBe(201);

		expect(member).toBeUndefined();
		expect(ban).toBeDefined();
	});
});

describe('PATCH /groups/:groupId/bans/:memberId', () => {
	describe('Given invalid inputs', () => {
		it('rejects invalid parameters', async () => {
			const res = await requestJson(
				app,
				`${url}/john_doe`,
				{ reason: 'Test' },
				{ method: 'PATCH' },
			);

			expect(res.status).toBe(400);
		});

		it('rejects invalid bodies', async () => {
			const res = await requestJson(app, `${url}/1`, { reason: null }, { method: 'PATCH' });
			expect(res.status).toBe(400);
		});
	});

	it('rejects unauthenticated users', async () => {
		const res = await requestJson(app, `${url}/1`, { reason: 'Test' }, { method: 'PATCH' });
		expect(res.status).toBe(401);
	});

	it('retrieves not found for non-existent members', async () => {
		const res = await requestJson(
			app,
			`${url}/${Number.MAX_SAFE_INTEGER}`,
			{ reason: 'Test' },
			{ method: 'PATCH', headers: adminHeaders },
		);

		expect(res.status).toBe(404);
	});

	it('forbids members from updating bans', async () => {
		// Arrange
		await banService.create({
			actorId: owner.id,
			targetId: admin.id,
			groupId,
			body: { reason: 'Treason' },
		});

		// Act
		const res = await requestJson(
			app,
			`${url}/${admin.id}`,
			{ reason: 'Get rekt' },
			{ method: 'PATCH', headers: memberHeaders },
		);

		// Assert
		expect(res.status).toBe(403);
	});

	it('updates a ban', async () => {
		// Arrange
		await banService.create({
			actorId: admin.id,
			targetId: member.id,
			groupId,
			body: { reason: 'You got rekt' },
		});

		// Act
		const res = await requestJson(
			app,
			`${url}/${member.id}`,
			{ expiresAt: Date.now() },
			{ method: 'PATCH', headers: adminHeaders },
		);

		// Assert
		const { data } = await res.json();

		expect(res.status).toBe(200);
		expect(data).toBeDefined();
	});
});

describe('DELETE /groups/:groupId/bans/:memberId', () => {
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

	it('forbids members from unbanning users', async () => {
		// Arrange
		await banService.create({
			actorId: owner.id,
			targetId: admin.id,
			groupId,
			body: { reason: 'Treason' },
		});

		// Act
		const res = await app.request(`${url}/${admin.id}`, {
			method: 'DELETE',
			headers: memberHeaders,
		});

		// Assert
		expect(res.status).toBe(403);
	});

	it('unbans a user', async () => {
		// Arrange
		await banService.create({
			actorId: admin.id,
			targetId: member.id,
			groupId,
			body: { reason: 'You got rekt' },
		});

		// Act
		const res = await app.request(`${url}/${member.id}`, {
			method: 'DELETE',
			headers: adminHeaders,
		});

		// Assert
		const { data } = await res.json();

		expect(res.status).toBe(200);
		expect(data).toBeDefined();
	});
});
