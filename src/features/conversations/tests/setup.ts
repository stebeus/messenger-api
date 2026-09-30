import type { Id } from '#contracts/entity.ts';

import { WebSocket } from 'ws';

import { createServer } from '#app.ts';
import { config } from '#config.ts';
import { groupCommands } from '#features/conversations/groups/commands.ts';
import { createAuthenticatedUser } from '#features/users/tests/factories.ts';

export const url = '/api/v1/conversations';

export const serveWebSocket = () => {
	const server = createServer(config.app.port + 1);
	const address = server.address();

	if (address == null || typeof address === 'string') {
		throw new Error('Server address is unavailable');
	}

	return { server, port: address.port } as const;
};

export type WebSocketServer = ReturnType<typeof serveWebSocket>;

export const setUpConversation = async () => {
	const { user, headers } = await createAuthenticatedUser();

	const { conversationId } = await groupCommands.create({
		userId: user.id,
		body: { name: 'Group' },
	});

	return { owner: user, ownerHeaders: headers, conversationId } as const;
};

export type ConversationWebSocketSetup = Readonly<{
	port: number;
	headers: Headers;
	conversationId: Id;
}>;

export const connectWebSocket = async ({
	port,
	headers,
	conversationId,
}: ConversationWebSocketSetup) => {
	const cookie = headers.get('Cookie');
	if (cookie == null) throw new Error('Cookie is required');

	const ws = new WebSocket(`ws://localhost:${port}${url}/${conversationId}/ws`, {
		headers: { cookie },
	});

	await new Promise((resolve, reject) => {
		ws.once('open', resolve);
		ws.once('error', reject);
	});

	type Message = Readonly<{
		type: string;
		data: unknown;
	}>;

	type Closure = Readonly<{
		code: number;
		reason: string;
	}>;

	const message = new Promise<Message>((resolve) =>
		ws.once('message', (data) => resolve(JSON.parse(data.toString()))),
	);

	const closure = new Promise<Closure>((resolve) =>
		ws.once('close', (code, reason) => resolve({ code, reason: reason.toString() })),
	);

	return { ws, message, closure } as const;
};
