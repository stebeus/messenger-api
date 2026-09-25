import { describe, expect, it } from 'vitest';

import { containsGroupName, filterGroupMember } from '#features/conversations/groups/helpers.ts';

describe('containsGroupName', () => {
	it('creates nothing when given no group name', () => {
		const groupQuery = containsGroupName();
		expect(groupQuery).toBeUndefined();
	});

	it('creates a search query when given a group name', () => {
		const groupQuery = containsGroupName('Group');
		expect(groupQuery).toStrictEqual({ name: { like: '%Group%' } });
	});
});

describe('filterGroupMember', () => {
	it('creates a group member filter', () => {
		const groupMember = filterGroupMember('1');
		expect(groupMember).toStrictEqual({ conversation: { members: { userId: '1' } } });
	});
});
