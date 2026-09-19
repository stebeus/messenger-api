import { describe, expect, it } from 'vitest';

import { capitalize, formatMaxLength, formatMinLength, toTitleCase } from '#utils/formatters.ts';

describe('capitalize', () => {
	it('capitalizes strings', () => {
		const capitalized = capitalize('hello, worlD!');
		expect(capitalized).toBe('Hello, worlD!');
	});
});

describe('toTitleCase', () => {
	it('title cases strings', () => {
		const titleCased = toTitleCase('hello, worlD!');
		expect(titleCased).toBe('Hello, World!');
	});
});

describe('formatMinLength', () => {
	describe('Given invalid lengths', () => {
		it('rejects floats', () => {
			expect(() => formatMinLength('field', 0.1)).toThrow('Length must be an integer');
		});

		it('rejects negative integers', () => {
			expect(() => formatMinLength('field', -1)).toThrow('Length must be positive');
		});
	});

	it('defaults to a required field message', () => {
		const formatted = formatMinLength('field');
		expect(formatted).toBe('Field is required');
	});

	it('formats minimum length messages', () => {
		const formatted = formatMinLength('field', 2);
		expect(formatted).toBe('Field must be at least 2 characters long');
	});
});

describe('formatMaxLength', () => {
	describe('Given invalid lengths', () => {
		it('rejects floats', () => {
			expect(() => formatMinLength('field', 0.1)).toThrow('Length must be an integer');
		});

		it('rejects negative integers', () => {
			expect(() => formatMinLength('field', -1)).toThrow('Length must be positive');
		});
	});

	it('formats singular maximum length messages', () => {
		const formatted = formatMaxLength('field', 1);
		expect(formatted).toBe('Field cannot be longer than 1 character');
	});

	it('formats plural maximum length messages', () => {
		const formatted = formatMaxLength('field', 2);
		expect(formatted).toBe('Field cannot be longer than 2 characters');
	});
});
