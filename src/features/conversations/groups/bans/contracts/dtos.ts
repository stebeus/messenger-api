import * as z from 'zod';

import { UserQuery, userSorts } from '#features/users/contracts/dtos.ts';

import { BanUpdate, NewBan } from './entity.ts';

export const banSorts = [...userSorts, 'expiresAt'] as const;

export const BanQuery = z
	.strictObject({
		...UserQuery.shape,
		sort: z.enum(banSorts).default('createdAt'),
	})
	.partial();

export const CreateBanBodyRequest = NewBan.omit({ userId: true, groupId: true });

export const UpdateBanBodyRequest = BanUpdate.omit({ userId: true, groupId: true });

export type BanQuery = z.infer<typeof BanQuery>;

export type CreateBanBodyRequest = z.infer<typeof CreateBanBodyRequest>;

export type UpdateBanBodyRequest = z.infer<typeof UpdateBanBodyRequest>;
