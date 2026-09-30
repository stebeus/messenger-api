import { env, loadEnvFile } from 'node:process';

import * as z from 'zod';

import { catchError } from './utils/errors.ts';

try {
	loadEnvFile();
} catch (error) {
	const caught = catchError(error);
	if (caught.code !== 'ENOENT') throw caught;
}

const dbUrlRegex = /(postgres(?:ql)?):\/\/(?:([^@\s]+)@)?([^/\s]+)(?:\/(\w+))?(?:\?(.+))?/;
const supabaseHostnameRegex = /^[a-z0-9]{20}\.supabase\.co\/?$/;

const Env = z
	.object({
		NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
		API_URL: z.httpUrl().normalize().optional(),
		CLIENT_URL: z.url().normalize().default('*'),
		PORT: z.coerce.number().int().positive().default(3000),
		DATABASE_URL: z.url().regex(dbUrlRegex),
		AUTH_SECRET: z.string(),
		STORAGE_SECRET: z.string(),
		STORAGE_URL: z.url({ protocol: /^https?$/, hostname: supabaseHostnameRegex }).normalize(),
	})
	.readonly();

const { success, error, data } = Env.safeParse(env);
if (!success) throw new Error(z.prettifyError(error));

const dbUrl = new URL(data.DATABASE_URL);
if (data.NODE_ENV === 'test') dbUrl.pathname += '_test';

export const config = {
	env: data.NODE_ENV,
	app: {
		port: data.PORT,
		url: data.API_URL ?? `http://localhost:${data.PORT}`,
		clientUrl: data.CLIENT_URL,
	},
	db: {
		url: dbUrl.toString(),
	},
	auth: {
		secret: data.AUTH_SECRET,
	},
	storage: {
		secret: data.STORAGE_SECRET,
		url: `${data.STORAGE_URL}/storage/v1`,
	},
} as const;
