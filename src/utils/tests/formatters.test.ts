import { describe, expect, it } from 'vitest';

import { capitalize, toTitleCase } from '#utils/formatters.ts';

describe('capitalize', () => {
	it('capitalizes strings', () => {
		const capitalized = capitalize('hello, worlD!');
		expect(capitalized).toBe('Hello, worlD!');
	});
});

describe('toTitleCase', () => {
	it('title cases strings', () => {
		const titleCased = toTitleCase('hello, world!');
		expect(titleCased).toBe('Hello, World!');
	});
});
