import type { Id } from '#contracts/entities.ts';

import { contains } from '#db/helpers.ts';

export const userRelations = { groups: true, memberships: true } as const;

export const containsName = (name?: string) =>
	name == null
		? undefined
		: { OR: [{ username: contains(name) }, { displayName: contains(name) }] };

export const createUserFilter = (id: Id) => ({ where: { NOT: { id } } }) as const;
