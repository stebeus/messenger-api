import * as z from 'zod';

import { User } from '#features/users/contracts/entity.ts';
import {
	createConflictErrorResponse,
	createNotFoundErrorResponse,
	id,
} from '#root/src/contracts/index.ts';

import { Member, MemberUpdate } from './entity.ts';

export const MemberParams = z.object({
	memberId: id,
});

export const UpdateMemberBodyRequest = MemberUpdate.pick({ role: true });

export const ListMembersResponse = z.array(
	z.object({
		...Member.shape,
		user: User,
	}),
);

export const MemberNotFoundErrorResponse = createNotFoundErrorResponse({
	resource: 'member',
});

export const MemberConflictErrorResponse = createConflictErrorResponse({
	resource: 'member',
});

export type MemberParams = z.infer<typeof MemberParams>;

export type UpdateMemberBodyRequest = z.infer<typeof UpdateMemberBodyRequest>;

export type ListMembersResponse = z.infer<typeof ListMembersResponse>;
