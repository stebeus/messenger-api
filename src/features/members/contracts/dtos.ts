import * as z from 'zod';

import { id } from '#contracts/entities.ts';

import { MemberUpdate } from './entity.ts';

export const MemberParams = z.object({
	memberId: id,
});

export const UpdateMemberBody = MemberUpdate.pick({ role: true });

export type MemberParams = z.infer<typeof MemberParams>;

export type UpdateMemberBody = z.infer<typeof UpdateMemberBody>;
