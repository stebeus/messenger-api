import { Member } from '#features/conversations/members/contracts/entity.ts';
import { createTimestamps, defaultId } from '#utils/test.ts';

type MemberOptions = Partial<Member>;

const { defaultValue: defaultRole } = Member.shape.role.def;

export const createMember = ({
	userId = defaultId,
	conversationId = defaultId,
	role = defaultRole,
	...timestamps
}: MemberOptions = {}) =>
	({ ...createTimestamps(timestamps), userId, conversationId, role }) as const;
