import { drizzleAdapter } from '@better-auth/drizzle-adapter/relations-v2';
import { betterAuth } from 'better-auth/minimal';
import { testUtils, username } from 'better-auth/plugins';

import { config } from '#config.ts';
import { db } from '#db/client.ts';
import * as schema from '#db/schemas/auth.ts';
import { userConstants } from '#features/users/contracts/index.ts';

const authConfig = {
	baseURL: config.app.url,
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
	trustedOrigins: [
		config.app.url,
		'https://registry.scalar.com/@stebeus/apis/messenger-rest-api-reference',
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
} as const;

const usernameConfig = username({
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
});

export const auth = betterAuth({ ...authConfig, plugins: [usernameConfig] });

export const testAuth = betterAuth({ ...authConfig, plugins: [usernameConfig, testUtils()] });
