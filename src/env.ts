import process from 'node:process';

import * as z from 'zod';

import { catchError } from './utils/errors.ts';

try {
	process.loadEnvFile();
} catch (error) {
	const caught = catchError(error);
	if (caught.code !== 'ENOENT') throw caught;
}

const dbUrlRegex = /(postgres(?:ql)?):\/\/(?:([^@\s]+)@)?([^/\s]+)(?:\/(\w+))?(?:\?(.+))?/;

const Env = z.object({
	CLIENT_URL: z.url().default('*'),
	DATABASE_URL: z.url().regex(dbUrlRegex),
	PORT: z.coerce.number().int().positive().default(3000),

	// Better Auth
	BETTER_AUTH_SECRET: z.string(),
	BETTER_AUTH_URL: z.httpUrl().normalize(),
});

const { success, error, data } = z.safeParse(Env, process.env);

if (!success) throw new Error(z.prettifyError(error));

export const env = data;
