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
		CLIENT_URL: z.url().normalize().default('*'),
		DATABASE_URL: z.url().regex(dbUrlRegex),
		PORT: z.coerce.number().int().positive().default(3000),

		AUTH_SECRET: z.string(),
		AUTH_URL: z.httpUrl().normalize().optional(),

		STORAGE_SECRET: z.string(),
		STORAGE_URL: z.url({ protocol: /^https?$/, hostname: supabaseHostnameRegex }).normalize(),
	})
	.readonly();

const { success, error, data } = Env.safeParse(env);
if (!success) throw new Error(z.prettifyError(error));

export const config = {
	clientUrl: data.CLIENT_URL,
	dbUrl: data.DATABASE_URL,
	port: data.PORT,
	auth: {
		secret: data.AUTH_SECRET,
		url: data.AUTH_URL ?? `http://localhost:${data.PORT}`,
	},
	storage: {
		secret: data.STORAGE_SECRET,
		url: `${data.STORAGE_URL}/storage/v1`,
	},
} as const;
