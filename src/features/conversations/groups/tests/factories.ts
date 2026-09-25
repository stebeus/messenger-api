import { Group } from '#features/conversations/groups/contracts/entity.ts';
import { createTimestamps, defaultId } from '#utils/test.ts';

type GroupOptions = Partial<Group>;

const { defaultValue: defaultVisibility } = Group.shape.visibility.def;

export const createGroup = ({
	conversationId = defaultId,
	ownerId = defaultId,
	name = 'Group',
	description = '',
	avatar = '',
	visibility = defaultVisibility,
	...timestamps
}: GroupOptions = {}) =>
	({
		...createTimestamps(timestamps),
		conversationId,
		ownerId,
		name,
		description,
		avatar,
		visibility,
	}) as const;
