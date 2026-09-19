import * as z from 'zod';

import { id } from '#contracts/entities.ts';

import { GroupUpdate, NewGroup } from './entity.ts';

export const GroupParams = z.object({
	groupId: id,
});

export const CreateGroupBody = NewGroup.omit({ conversationId: true });

export const UpdateGroupBody = GroupUpdate.omit({ conversationId: true });

export type GroupParams = z.infer<typeof GroupParams>;

export type CreateGroupBody = z.input<typeof CreateGroupBody>;

export type UpdateGroupBody = z.infer<typeof UpdateGroupBody>;
