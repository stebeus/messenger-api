import * as z from 'zod';

import { Group } from '#features/conversations/groups/contracts/entity.ts';
import { UserQuery, userSorts } from '#features/users/contracts/dtos.ts';
import { User } from '#features/users/contracts/entity.ts';

import { Ban, BanUpdate, NewBan } from './entity.ts';

export const banSorts = [...userSorts, 'expiresAt'] as const;

export const BanQuery = z
	.strictObject({
		...UserQuery.shape,
		sort: z.enum(banSorts).default('createdAt'),
	})
	.partial();

export const CreateBanBodyRequest = NewBan.omit({ userId: true, groupId: true });

export const UpdateBanBodyRequest = BanUpdate.omit({ userId: true, groupId: true });

export const ListBansResponse = z.array(
	z.object({
		...Ban.shape,
		user: User,
		group: Group,
	}),
);

export type BanQuery = z.infer<typeof BanQuery>;

export type CreateBanBodyRequest = z.infer<typeof CreateBanBodyRequest>;

export type UpdateBanBodyRequest = z.infer<typeof UpdateBanBodyRequest>;

export type ListBansResponse = z.infer<typeof ListBansResponse>;
