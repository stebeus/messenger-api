import * as z from 'zod';

import { id } from '#contracts/entities.ts';
import { MemberParams } from '#features/members/contracts/dtos.ts';
import { MessageParams } from '#features/messages/contracts/dtos.ts';

import { GroupUpdate, NewGroup } from './entity.ts';

export const GroupParams = z.object({
	groupId: id,
});

export const GroupMemberParams = z.object({ ...GroupParams.shape, ...MemberParams.shape });

export const GroupMessageParams = z.object({ ...GroupParams.shape, ...MessageParams.shape });

export const CreateGroupBody = NewGroup.omit({ conversationId: true });

export const UpdateGroupBody = GroupUpdate.omit({ conversationId: true });

export type GroupParams = z.infer<typeof GroupParams>;

export type CreateGroupBody = z.input<typeof CreateGroupBody>;

export type UpdateGroupBody = z.infer<typeof UpdateGroupBody>;

export type GroupMemberParams = z.infer<typeof GroupMemberParams>;

export type GroupMessageParams = z.infer<typeof GroupMessageParams>;
