import { env } from './env.ts';

export const config = {
	clientUrl: env.CLIENT_URL,
	dbUrl: env.DATABASE_URL,
	port: env.PORT,
	auth: {
		secret: env.AUTH_SECRET,
		url: env.AUTH_URL ?? `http://localhost:${env.PORT}`,
	},
	storage: {
		secret: env.STORAGE_SECRET,
		url: `${env.STORAGE_URL}/storage/v1`,
	},
} as const;
