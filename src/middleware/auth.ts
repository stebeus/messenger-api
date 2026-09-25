import { createMiddleware } from 'hono/factory';

import { auth } from '#lib/auth.ts';
import { UnauthorizedError } from '#utils/errors.ts';

export type AuthEnv = {
	Variables: {
		auth: typeof auth.$Infer.Session;
	};
};

export const requireAuth = createMiddleware<AuthEnv>(async (c, next) => {
	const session = await auth.api.getSession({ headers: c.req.raw.headers });
	if (session == null) throw new UnauthorizedError();

	c.set('auth', session);

	await next();
});
