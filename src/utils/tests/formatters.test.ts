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
		it.for`
			case                   | length | expected
			${'floats'}            | ${0.1} | ${'an integer'}
			${'negative integers'} | ${-1}  | ${'positive'}
		`('rejects $case', () => {
			expect(() => formatMinLength(0.1, 'field')).toThrow('Length must be an integer');
		});
	});

	it('formats a minimum length of 1 as required', () => {
		const formatted = formatMinLength(1, 'field');
		expect(formatted).toBe('Field is required');
	});

	it('formats minimum length messages', () => {
		const formatted = formatMinLength(2, 'field');
		expect(formatted).toBe('Field must be at least 2 characters long');
	});
});

describe('formatMaxLength', () => {
	describe('Given invalid lengths', () => {
		it.for`
			case                   | length | expected
			${'floats'}            | ${0.1} | ${'an integer'}
			${'negative integers'} | ${-1}  | ${'positive'}
		`('rejects $case', () => {
			expect(() => formatMinLength(0.1, 'field')).toThrow('Length must be an integer');
		});
	});

	it('formats singular maximum length messages', () => {
		const formatted = formatMaxLength(1, 'field');
		expect(formatted).toBe('Field cannot be longer than 1 character');
	});

	it('formats plural maximum length messages', () => {
		const formatted = formatMaxLength(2, 'field');
		expect(formatted).toBe('Field cannot be longer than 2 characters');
	});
});
