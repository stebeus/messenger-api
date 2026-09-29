import type { ValidationTargets } from 'hono';
import type * as z from 'zod';

import { flattenErrors } from '@hono/standard-validator';
import { validator } from 'hono-openapi';

import { BadRequestError } from '#utils/errors.ts';

export const validate = <Target extends keyof ValidationTargets, Schema extends z.ZodType>(
	target: Target,
	schema: Schema,
) =>
	validator(target, schema, (result) => {
		if (!result.success) throw new BadRequestError({ details: flattenErrors(result.error) });
	});
