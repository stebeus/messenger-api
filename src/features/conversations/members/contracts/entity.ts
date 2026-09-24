import * as z from 'zod';

import { id, Timestamps, timestamps } from '#contracts/entity.ts';

export const roles = ['member', 'admin', 'owner'] as const;

const [defaultRole] = roles;

export const Member = z.object({
	...Timestamps.shape,
	userId: id,
	conversationId: id,
	role: z.enum(roles).default(defaultRole),
});

export const NewMember = Member.omit(timestamps);

export const MemberUpdate = z
	.object({
		...Member.shape,
		role: z.enum(roles).exclude(['owner']).default(defaultRole),
	})
	.omit(timestamps);

export type Member = z.infer<typeof Member>;

export type NewMember = z.input<typeof NewMember>;

export type MemberUpdate = z.input<typeof MemberUpdate>;
