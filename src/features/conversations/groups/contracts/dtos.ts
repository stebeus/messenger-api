import * as z from 'zod';

import { avatar, id } from '#contracts/index.ts';
import { Member, MemberParams } from '#features/conversations/members/contracts/index.ts';
import { Message, MessageParams } from '#features/conversations/messages/contracts/index.ts';

import { Group, GroupUpdate, NewGroup } from './entity.ts';

const GetGroupResponse = z.object({
	...Group.shape,
	members: z.array(Member),
});

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

export const ListGroupsResponse = z.array(GetGroupResponse);

export const ListJoinedGroupsResponse = z.array(
	z.object({
		...GetGroupResponse.shape,
		messages: z.array(Message),
	}),
);

export type GroupParams = z.infer<typeof GroupParams>;

export type GroupMemberParams = z.infer<typeof GroupMemberParams>;

export type GroupMessageParams = z.infer<typeof GroupMessageParams>;

export type CreateGroupBodyRequest = z.input<typeof CreateGroupBodyRequest>;

export type UpdateGroupBodyRequest = z.infer<typeof UpdateGroupBodyRequest>;

export type ListGroupsResponse = z.infer<typeof ListGroupsResponse>;

export type ListJoinedGroupsResponse = z.infer<typeof ListJoinedGroupsResponse>;
