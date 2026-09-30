import * as z from 'zod';

import {
	createConflictErrorResponse,
	createNotFoundErrorResponse,
	createUnprocessableContentErrorResponse,
	id,
} from '#contracts/index.ts';
import { User, UserQuery } from '#features/users/contracts/index.ts';

import { FriendRequest } from './entity.ts';

export const FriendRequestParams = z.object({
	recipientId: id,
});

export const directions = ['incoming', 'outgoing'] as const;

export const FriendRequestQuery = z
	.strictObject({
		...UserQuery.shape,
		direction: z.enum(directions),
	})
	.partial();

export const ListFriendRequestsResponse = z.array(
	z.object({
		...FriendRequest.shape,
		requester: z.nullable(User),
		recipient: z.nullable(User),
	}),
);

export const FriendRequestNotFoundErrorResponse = createNotFoundErrorResponse({
	resource: 'friend request',
});

export const FriendRequestConflictErrorResponse = createConflictErrorResponse({
	resource: 'friend request',
});

export const FriendRequestUnprocessableErrorResponse = createUnprocessableContentErrorResponse(
	'Cannot send a friend request to yourself',
);

export type FriendRequestParams = z.infer<typeof FriendRequestParams>;

export type FriendRequestQuery = z.infer<typeof FriendRequestQuery>;

export type ListFriendRequestsResponse = z.infer<typeof ListFriendRequestsResponse>;
