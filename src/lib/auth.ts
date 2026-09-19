import { drizzleAdapter } from '@better-auth/drizzle-adapter/relations-v2';
import { betterAuth } from 'better-auth/minimal';
import { username } from 'better-auth/plugins';

import { db } from '#db/client.ts';
import * as schema from '#db/schemas/auth.ts';
import * as user from '#features/users/contracts/constants.ts';

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: 'pg',
		schema,
		schemaName: 'auth',
		usePlural: true,
	}),
	advanced: {
		database: {
			generateId: 'serial',
		},
	},
	emailAndPassword: {
		autoSignIn: true,
		enabled: true,
		maxPasswordLength: user.password.maxLength,
		minPasswordLength: user.password.minLength,
	},
	plugins: [
		username({
			maxUsernameLength: user.username.maxLength,
			minUsernameLength: user.username.minLength,
			schema: {
				user: {
					fields: {
						displayUsername: 'displayName',
					},
				},
			},
			usernameValidator: (username) => user.username.regex.test(username),
		}),
	],
	user: {
		additionalFields: {
			bio: {
				required: false,
				type: 'string',
			},
		},
		fields: {
			image: 'avatar',
		},
	},
});
