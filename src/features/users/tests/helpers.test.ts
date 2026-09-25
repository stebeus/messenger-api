import { describe, expect, it } from 'vitest';

import { containsName } from '#features/users/helpers.ts';

describe('containsName', () => {
	it('creates nothing when given no name', () => {
		const userQuery = containsName();
		expect(userQuery).toBeUndefined();
	});

	it('creates a search query when given a name', () => {
		const userQuery = containsName('John Doe');

		expect(userQuery).toStrictEqual({
			OR: [{ username: { like: '%John Doe%' } }, { displayName: { like: '%John Doe%' } }],
		});
	});
});
