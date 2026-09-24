import { drizzleAdapter } from '@better-auth/drizzle-adapter/relations-v2';
import { betterAuth } from 'better-auth/minimal';
import { username } from 'better-auth/plugins';

import { config } from '#config.ts';
import { db } from '#db/client.ts';
import * as schema from '#db/schemas/auth.ts';
import { userConstants } from '#features/users/contracts/index.ts';

export const auth = betterAuth({
	baseURL: config.auth.url,
	database: drizzleAdapter(db, {
		provider: 'pg',
		schema,
		schemaName: 'auth',
		usePlural: true,
	}),
	secret: config.auth.secret,
	advanced: {
		database: {
			generateId: 'serial',
		},
	},
	emailAndPassword: {
		autoSignIn: true,
		enabled: true,
		maxPasswordLength: userConstants.password.maxLength,
		minPasswordLength: userConstants.password.minLength,
	},
	plugins: [
		username({
			maxUsernameLength: userConstants.username.maxLength,
			minUsernameLength: userConstants.username.minLength,
			schema: {
				user: {
					fields: {
						displayUsername: 'displayName',
					},
				},
			},
			usernameValidator: (username) => userConstants.username.regex.test(username),
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
