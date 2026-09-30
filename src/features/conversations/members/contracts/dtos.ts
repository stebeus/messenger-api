import * as z from 'zod';

import { id } from '#contracts/entity.ts';
import { User } from '#features/users/contracts/entity.ts';

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

export type MemberParams = z.infer<typeof MemberParams>;

export type UpdateMemberBodyRequest = z.infer<typeof UpdateMemberBodyRequest>;

export type ListMembersResponse = z.infer<typeof ListMembersResponse>;
