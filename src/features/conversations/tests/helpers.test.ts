import { describe, expect, it } from 'vitest';

import { filterMember } from '#features/conversations/helpers.ts';

describe('filterMember', () => {
	it('creates a conversation member filter', () => {
		const member = filterMember('1');
		expect(member).toStrictEqual({ members: { userId: '1' } });
	});
});
