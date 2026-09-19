import * as z from 'zod';

import { id } from '#contracts/entities.ts';

export const DirectMessageParams = z.object({
	dmId: id,
});

export type DirectMessageParams = z.infer<typeof DirectMessageParams>;
