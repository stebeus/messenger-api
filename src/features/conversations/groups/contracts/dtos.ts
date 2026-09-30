import * as z from 'zod';

import { avatar, id } from '#contracts/index.ts';
import { MemberParams } from '#features/conversations/members/contracts/dtos.ts';
import { MessageParams } from '#features/conversations/messages/contracts/dtos.ts';

import { GroupUpdate, NewGroup } from './entity.ts';

export const GroupParams = z.object({
	groupId: id,
});

export const GroupMemberParams = z.object({ ...GroupParams.shape, ...MemberParams.shape });

export const GroupMessageParams = z.object({ ...GroupParams.shape, ...MessageParams.shape });

export const CreateGroupBodyRequest = z.object({
	...NewGroup.omit({ conversationId: true, ownerId: true }).shape,
	avatar,
});

export const UpdateGroupBodyRequest = z.object({
	...GroupUpdate.omit({ conversationId: true }).shape,
	avatar,
});

export type GroupParams = z.infer<typeof GroupParams>;

export type GroupMemberParams = z.infer<typeof GroupMemberParams>;

export type GroupMessageParams = z.infer<typeof GroupMessageParams>;

export type CreateGroupBodyRequest = z.input<typeof CreateGroupBodyRequest>;

export type UpdateGroupBodyRequest = z.infer<typeof UpdateGroupBodyRequest>;
