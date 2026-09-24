import * as z from 'zod';

import { UserQuery, userSorts } from '#features/users/contracts/dtos.ts';

import { BanUpdate, NewBan } from './entity.ts';

export const banSorts = [...userSorts, 'expiresAt'] as const;

export const BanQuery = z
	.object({
		...UserQuery.shape,
		sort: z.enum(banSorts).default('createdAt'),
	})
	.partial();

export const CreateBanBody = NewBan.omit({ userId: true, groupId: true });

export const UpdateBanBody = BanUpdate.omit({ userId: true, groupId: true });

export type BanQuery = z.infer<typeof BanQuery>;

export type CreateBanBody = z.infer<typeof CreateBanBody>;

export type UpdateBanBody = z.infer<typeof UpdateBanBody>;
