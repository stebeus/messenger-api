import type * as z from 'zod';

import { BanUpdate, NewBan } from './entity.ts';

export const CreateBanBody = NewBan.omit({ userId: true, groupId: true });

export const UpdateBanBody = BanUpdate.omit({ userId: true, groupId: true });

export type CreateBanBody = z.infer<typeof CreateBanBody>;

export type UpdateBanBody = z.infer<typeof UpdateBanBody>;
