import { resetTestDb } from '#db/helpers.ts';
import { groupCommands } from '#features/conversations/groups/commands.ts';
import { memberService } from '#features/conversations/members/services.ts';
import { createAuthenticatedUser } from '#features/users/tests/factories.ts';

export const setUpGroup = async () => {
	await resetTestDb();

	const ownerAuth = await createAuthenticatedUser();
	const adminAuth = await createAuthenticatedUser();
	const memberAuth = await createAuthenticatedUser();

	const { conversationId: groupId } = await groupCommands.create({
		userId: ownerAuth.user.id,
		body: { name: 'Group' },
	});

	await memberService.joinGroup({
		userId: adminAuth.user.id,
		groupId,
	});

	await memberService.joinGroup({
		userId: memberAuth.user.id,
		groupId,
	});

	await memberService.changeRole({
		actorId: ownerAuth.user.id,
		targetId: adminAuth.user.id,
		groupId,
		role: 'admin',
	});

	return {
		groupId,
		owner: ownerAuth.user,
		ownerHeaders: ownerAuth.headers,
		admin: adminAuth.user,
		adminHeaders: adminAuth.headers,
		member: memberAuth.user,
		memberHeaders: memberAuth.headers,
	} as const;
};

export type GroupSetup = Awaited<ReturnType<typeof setUpGroup>>;
