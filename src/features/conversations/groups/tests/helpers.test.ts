import { describe, expect, it } from 'vitest';

import {
	containsGroupName,
	extractGroupRelations,
	filterGroupMember,
} from '#features/conversations/groups/helpers.ts';
import { createMember } from '#features/conversations/members/tests/factories.ts';
import { createMessage } from '#features/conversations/messages/tests/factories.ts';
import { createConversation } from '#features/conversations/tests/factories.ts';

import { createGroup } from './factories.ts';

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

describe('extractGroupRelations', () => {
	it('extracts members without exposing the conversation entity', () => {
		// Arrange
		const rawGroupResponse = {
			...createGroup(),
			conversation: { ...createConversation(), members: [createMember()] },
		};

		// Act
		const group = extractGroupRelations(rawGroupResponse);

		// Assert
		expect(group).toMatchObject({ conversationId: '1', name: 'Group', members: group.members });
	});

	it('extracts members and messages when available', () => {
		// Arrange
		const rawJoinedGroupResponse = {
			...createGroup(),
			conversation: {
				...createConversation(),
				members: [createMember()],
				messages: [createMessage()],
			},
		};

		// Act
		const group = extractGroupRelations(rawJoinedGroupResponse);

		// Assert
		const { members, messages } = rawJoinedGroupResponse.conversation;
		expect(group).toMatchObject({ conversationId: '1', name: 'Group', members, messages });
	});
});
