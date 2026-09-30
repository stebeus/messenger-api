import { Hono } from 'hono';
import { describeRoute, resolver } from 'hono-openapi';

import { BadRequestErrorResponse, HttpErrorResponse } from '#contracts/dtos.ts';
import { UserParams } from '#features/users/contracts/dtos.ts';
import { requireAuth, validate } from '#middleware/index.ts';

import {
	FriendRequest,
	FriendRequestParams,
	FriendRequestQuery,
	ListFriendRequestsResponse,
} from './contracts/index.ts';
import { friendRequestRepository } from './repository.ts';
import { friendRequestService } from './services.ts';

export const friendRequests = new Hono();

friendRequests.get(
	'/',
	describeRoute({
		description: 'Retrieves friend requests matching the specified query.',
		tags: ['Friend requests'],
		responses: {
			200: {
				description: 'Friend requests matching the specified query.',
				content: { 'application/json': { schema: resolver(ListFriendRequestsResponse) } },
			},
			400: {
				description: 'Invalid query parameters.',
				content: { 'application/json': { schema: resolver(BadRequestErrorResponse) } },
			},
			401: {
				description: 'Authentication is required.',
				content: { 'application/json': { schema: resolver(HttpErrorResponse) } },
			},
		},
	}),
	validate('query', FriendRequestQuery),
	requireAuth,
	async (c) => {
		const { user } = c.var.auth;
		const query = c.req.valid('query');

		const data = await friendRequestRepository.find({ userId: user.id, query });

		return c.json({ data });
	},
);

friendRequests.post(
	'/:recipientId',
	describeRoute({
		description: 'Sends a friend request to another user.',
		tags: ['Friend requests'],
		responses: {
			201: {
				description: 'The sent friend request.',
				content: { 'application/json': { schema: resolver(FriendRequest) } },
			},
			400: {
				description: 'Invalid ID parameter.',
				content: { 'application/json': { schema: resolver(BadRequestErrorResponse) } },
			},
			401: {
				description: 'Authentication is required.',
				content: { 'application/json': { schema: resolver(HttpErrorResponse) } },
			},
			404: {
				description: 'Recipient user not found.',
				content: { 'application/json': { schema: resolver(HttpErrorResponse) } },
			},
			422: {
				description: 'A user cannot send a friend request to themselves.',
				content: { 'application/json': { schema: resolver(HttpErrorResponse) } },
			},
			409: {
				description: 'A friend request already exists or the users are already friends.',
				content: { 'application/json': { schema: resolver(HttpErrorResponse) } },
			},
		},
	}),
	validate('param', FriendRequestParams),
	requireAuth,
	async (c) => {
		const { user } = c.var.auth;
		const { recipientId } = c.req.valid('param');

		const data = await friendRequestService.send({ requesterId: user.id, recipientId });

		return c.json({ data }, 201);
	},
);

friendRequests.delete(
	'/:userId',
	describeRoute({
		description: 'Cancels a sent or received friend request.',
		tags: ['Friend requests'],
		responses: {
			200: {
				description: 'The cancelled friend request.',
				content: { 'application/json': { schema: resolver(FriendRequest) } },
			},
			400: {
				description: 'Invalid ID parameter.',
				content: { 'application/json': { schema: resolver(BadRequestErrorResponse) } },
			},
			401: {
				description: 'Authentication is required.',
				content: { 'application/json': { schema: resolver(HttpErrorResponse) } },
			},
			404: {
				description: 'Friend request not found.',
				content: { 'application/json': { schema: resolver(HttpErrorResponse) } },
			},
		},
	}),
	validate('param', UserParams),
	requireAuth,
	async (c) => {
		const { user } = c.var.auth;
		const { userId } = c.req.valid('param');

		const data = await friendRequestService.cancel({ user1Id: user.id, user2Id: userId });

		return c.json({ data });
	},
);
