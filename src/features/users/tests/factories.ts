import type { User } from '#features/users/contracts/entity.ts';

import { testAuth } from '#lib/auth.ts';
import { createTimestamps, defaultId } from '#utils/test.ts';

type UserOptions = Partial<User>;

const generateUniqueString = (string?: string) =>
	`${string}_${Temporal.Now.instant().epochNanoseconds}`;

export const createUser = ({
	id = defaultId,
	username = generateUniqueString('john_doe'),
	displayName = username,
	bio = '',
	avatar = '',
	...timestamps
}: UserOptions = {}) =>
	({
		...createTimestamps(timestamps),
		id,
		name: 'John Doe',
		email: `${username}@email.com`,
		emailVerified: false,
		username,
		displayName,
		bio,
		avatar,
	}) as const;

export type TestUserResult = ReturnType<typeof createUser>;

export const createAuthenticatedUser = async (options?: UserOptions) => {
	const { test } = await testAuth.$context;

	const user = createUser(options);

	const savedUser = await test.saveUser(user);
	const headers = await test.getAuthHeaders({ userId: savedUser.id });

	return { headers, user: savedUser } as const;
};
