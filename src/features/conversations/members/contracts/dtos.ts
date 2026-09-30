import * as z from 'zod';

import { id } from '#contracts/entity.ts';

import { MemberUpdate } from './entity.ts';

export const MemberParams = z.object({
	memberId: id,
});

export const UpdateMemberBodyRequest = MemberUpdate.pick({ role: true });

export type MemberParams = z.infer<typeof MemberParams>;

export type UpdateMemberBodyRequest = z.infer<typeof UpdateMemberBodyRequest>;
