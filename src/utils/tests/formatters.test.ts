import { describe, expect, it } from 'vitest';

import { toTitleCase } from '#utils/formatters.ts';

describe('toTitleCase', () => {
	it('title cases strings', () => {
		const titleCased = toTitleCase('hello, world!');
		expect(titleCased).toBe('Hello, World!');
	});
});
