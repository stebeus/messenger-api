import { Hono } from 'hono';
import { describeRoute, resolver } from 'hono-openapi';

import { BadRequestErrorResponse, HttpErrorResponse } from '#contracts/dtos.ts';
import { FriendRequest } from '#features/friend-requests/contracts/entity.ts';
import { friendRequestService } from '#features/friend-requests/services.ts';
import { UserQuery } from '#features/users/contracts/dtos.ts';
import { requireAuth, validate } from '#middleware/index.ts';

import {
	CreateFriendParams,
	FriendParams,
	Friendship,
	ListFriendsResponse,
} from './contracts/index.ts';
import { friendshipService } from './services.ts';

export const friends = new Hono();

friends.get(
	'/',
	describeRoute({
		description: 'Retrieves friends matching the specified query.',
		responses: {
			200: {
				description: 'Friends matching the specified query.',
				content: { 'application/json': { schema: resolver(ListFriendsResponse) } },
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
	validate('query', UserQuery),
	requireAuth,
	async (c) => {
		const { user } = c.var.auth;
		const query = c.req.valid('query');

		const data = await friendshipService.find({ userId: user.id, query });

		return c.json({ data });
	},
);

friends.post(
	'/:requesterId',
	describeRoute({
		description: 'Accepts a friend request.',
		responses: {
			201: {
				description: 'The new friendship.',
				content: { 'application/json': { schema: resolver(Friendship) } },
			},
			400: {
				description: 'Invalid parameters.',
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
	validate('param', CreateFriendParams),
	requireAuth,
	async (c) => {
		const { user } = c.var.auth;
		const { requesterId } = c.req.valid('param');

		const data = await friendRequestService.accept({ recipientId: user.id, requesterId });

		return c.json({ data }, 201);
	},
);

friends.delete(
	'/:friendId',
	describeRoute({
		description: 'Unfriends a user.',
		responses: {
			200: {
				description: 'The unfriended user.',
				content: { 'application/json': { schema: resolver(FriendRequest) } },
			},
			400: {
				description: 'Invalid parameters.',
				content: { 'application/json': { schema: resolver(BadRequestErrorResponse) } },
			},
			401: {
				description: 'Authentication is required.',
				content: { 'application/json': { schema: resolver(HttpErrorResponse) } },
			},
			404: {
				description: 'Friend not found.',
				content: { 'application/json': { schema: resolver(HttpErrorResponse) } },
			},
		},
	}),
	validate('param', FriendParams),
	requireAuth,
	async (c) => {
		const { user } = c.var.auth;
		const { friendId } = c.req.valid('param');

		const data = await friendshipService.unfriend({ user1Id: user.id, user2Id: friendId });

		return c.json({ data });
	},
);
