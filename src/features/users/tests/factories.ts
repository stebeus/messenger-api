import type { User } from '#features/users/contracts/entity.ts';

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
