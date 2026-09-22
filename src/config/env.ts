import process from 'node:process';

import * as z from 'zod';

import { catchError } from '#utils/errors.ts';

try {
	process.loadEnvFile();
} catch (error) {
	const caught = catchError(error);
	if (caught.code !== 'ENOENT') throw caught;
}

const dbUrlRegex = /(postgres(?:ql)?):\/\/(?:([^@\s]+)@)?([^/\s]+)(?:\/(\w+))?(?:\?(.+))?/;
const supabaseRegex = /^[a-z0-9]{20}\.supabase\.co\/?$/;

const Env = z
	.object({
		CLIENT_URL: z.url().normalize().default('*'),
		DATABASE_URL: z.url().regex(dbUrlRegex),
		PORT: z.coerce.number().int().positive().default(3000),

		// Auth
		AUTH_SECRET: z.string(),
		AUTH_URL: z.httpUrl().normalize().optional(),

		// Storage
		STORAGE_SECRET: z.string(),
		STORAGE_URL: z.url({ protocol: /^https?$/, hostname: supabaseRegex }).normalize(),
	})
	.readonly();

const { success, error, data } = z.safeParse(Env, process.env);

if (!success) throw new Error(z.prettifyError(error));

export const env = data;
