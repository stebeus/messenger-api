import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { app } from '#app.ts';
import { resetDb } from '#db/helpers.ts';
import { banService } from '#features/conversations/groups/bans/services.ts';
import { groupCommands } from '#features/conversations/groups/commands.ts';
import { memberService } from '#features/conversations/members/services.ts';
import { messageService } from '#features/conversations/messages/services.ts';
import { createAuthenticatedUser } from '#features/users/tests/factories.ts';
import { requestJson } from '#utils/test.ts';

import {
	connectWebSocket,
	serveWebSocket,
	setUpConversation,
	url,
	type WebSocketServer,
} from './setup.ts';

let wss: WebSocketServer;

beforeEach(async () => await resetDb());

beforeAll(() => (wss = serveWebSocket()));
afterAll(() => wss.server.close());

describe('WS /conversations/:conversationId/ws', () => {
	it('rejects invalid parameters', async () => {
		const res = await app.request(`${url}/john_doe/ws`);
		expect(res.status).toBe(400);
	});

	it('rejects unauthenticated users', async () => {
		const res = await app.request(`${url}/1/ws`);
		expect(res.status).toBe(401);
	});

	it('retrieves not found for non-existent joined conversations', async () => {
		// Arrange
		const { headers } = await createAuthenticatedUser();

		// Act
		const res = await app.request(`${url}/${Number.MAX_SAFE_INTEGER}/ws`, { headers });

		// Assert
		expect(res.status).toBe(404);
	});

	describe('Given connection closures', () => {
		it('closes when the conversation is deleted', async () => {
			// Arrange
			const { ownerHeaders, owner, conversationId } = await setUpConversation();

			const { closure } = await connectWebSocket({
				port: wss.port,
				headers: ownerHeaders,
				conversationId,
			});

			// Act
			await groupCommands.destroy({ userId: owner.id, groupId: conversationId });

			// Assert
			const { code } = await closure;
			expect(code).toBe(1011);
		});

		it('closes when the current member is kicked', async () => {
			// Arrange
			const { owner, conversationId } = await setUpConversation();
			const { user, headers } = await createAuthenticatedUser();

			await memberService.joinGroup({ userId: user.id, groupId: conversationId });

			const { closure } = await connectWebSocket({ port: wss.port, headers, conversationId });

			// Act
			await memberService.kick({ actorId: owner.id, targetId: user.id, groupId: conversationId });

			// Assert
			const { code } = await closure;
			expect(code).toBe(1008);
		});

		it('closes when the current member is banned', async () => {
			// Arrange
			const { owner, conversationId } = await setUpConversation();
			const { user, headers } = await createAuthenticatedUser();

			await memberService.joinGroup({ userId: user.id, groupId: conversationId });

			const { closure } = await connectWebSocket({ port: wss.port, headers, conversationId });

			// Act
			await banService.create({
				actorId: owner.id,
				targetId: user.id,
				groupId: conversationId,
				body: { reason: 'Test' },
			});

			// Assert
			const { code } = await closure;
			expect(code).toBe(1008);
		});
	});

	describe('Given an active connection', () => {
		it('receives group updates', async () => {
			// Arrange
			const { ownerHeaders, owner, conversationId } = await setUpConversation();

			const { message } = await connectWebSocket({
				port: wss.port,
				headers: ownerHeaders,
				conversationId,
			});

			// Act
			await groupCommands.update({
				userId: owner.id,
				groupId: conversationId,
				body: { description: 'Hi!' },
			});

			// Assert
			const event = await message;
			expect(event.type).toBe('group.updated');
		});

		it('receives sent messages', async () => {
			// Arrange
			const { ownerHeaders, owner, conversationId } = await setUpConversation();

			const { message } = await connectWebSocket({
				port: wss.port,
				headers: ownerHeaders,
				conversationId,
			});

			// Act
			await messageService.send({
				userId: owner.id,
				conversationId,
				body: { content: 'Hello, world!' },
			});

			// Assert
			const event = await message;
			expect(event.type).toBe('message.sent');
		});
	});
});

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
		const { conversationId } = await setUpConversation();
		const { headers } = await createAuthenticatedUser();

		// Act
		const res = await app.request(`${url}/${conversationId}/messages`, { headers });

		// Assert
		expect(res.status).toBe(403);
	});

	it('retrieves messages', async () => {
		// Arrange
		const { ownerHeaders, conversationId } = await setUpConversation();

		// Act
		const res = await app.request(`${url}/${conversationId}/messages`, {
			headers: ownerHeaders,
		});

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
		const { conversationId } = await setUpConversation();
		const { headers } = await createAuthenticatedUser();

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
		const { ownerHeaders, conversationId } = await setUpConversation();

		// Act
		const res = await requestJson(
			app,
			`${url}/${conversationId}/messages`,
			{ content: 'Hello, world!' },
			{ headers: ownerHeaders },
		);

		// Assert
		expect(res.status).toBe(201);
	});
});
