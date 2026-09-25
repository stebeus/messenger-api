import type { Id } from '#contracts/entity.ts';

import { describe, expect, it } from 'vitest';

import { mergeFriend, orderFriendshipId } from '#features/friendships/helpers.ts';
import { createUser, type TestUserResult } from '#features/users/tests/factories.ts';

import { createFriendship } from './factories.ts';

describe('mergeFriend', () => {
	type FriendshipResultOptions = Partial<{
		user1: TestUserResult;
		user2: TestUserResult;
	}>;

	const createFriendshipResult = ({ user1, user2 }: FriendshipResultOptions) =>
		({ ...createFriendship(), user1, user2 }) as const;

	const createExpectedMerge = (id?: Id) =>
		({ ...createFriendship(), friend: createUser({ id, username: 'john_doe' }) }) as const;

	it('merges user 1 as a friend when user 2 is empty', () => {
		// Arrange
		const user1 = createUser({ id: '1', username: 'john_doe' });
		const friendship = createFriendshipResult({ user1 });
		const expected = createExpectedMerge(user1.id);

		// Act
		const merged = mergeFriend(friendship);

		// Assert
		expect(merged).toStrictEqual(expected);
	});

	it('merges user 2 as a friend when user 1 is empty', () => {
		// Arrange
		const user2 = createUser({ id: '1', username: 'john_doe' });
		const friendship = createFriendshipResult({ user2 });
		const expected = createExpectedMerge(user2.id);

		// Act
		const merged = mergeFriend(friendship);

		// Assert
		expect(merged).toStrictEqual(expected);
	});
});

describe('orderFriendshipIds', () => {
	it('preserves ordered IDs', () => {
		// Arrange
		const friendshipId = { user1Id: '1', user2Id: '2' } as const;

		//  Act
		const orderedFriendshipId = orderFriendshipId(friendshipId);

		// Assert
		expect(orderedFriendshipId).toStrictEqual({ user1Id: '1', user2Id: '2' });
	});

	it('sorts IDs in ascending order', () => {
		// Arrange
		const friendshipId = { user1Id: '2', user2Id: '1' } as const;

		//  Act
		const orderedFriendshipId = orderFriendshipId(friendshipId);

		// Assert
		expect(orderedFriendshipId).toStrictEqual({ user1Id: '1', user2Id: '2' });
	});
});
