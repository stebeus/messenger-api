import { describe, expect, it } from 'vitest';

import { contains, exclude, orderBy, parseId } from './helpers.ts';

describe('contains', () => {
	it('creates nothing when given no data', () => {
		const query = contains();
		expect(query).toBeUndefined();
	});

	it('creates a search query when given data', () => {
		const query = contains('query');
		expect(query).toStrictEqual({ like: '%query%' });
	});
});

describe('exclude', () => {
	it('creates an exclusion filter', () => {
		const notId = exclude('1');
		expect(notId).toStrictEqual({ NOT: { id: '1' } });
	});
});

describe('orderBy', () => {
	describe('Given no inputs', () => {
		const expected = { orderBy: { createdAt: 'asc' } } as const;

		it('sorts by creation date', () => {
			const sorting = orderBy();
			expect(sorting).toStrictEqual(expected);
		});

		it('uses ascending order', () => {
			const sorting = orderBy();
			expect(sorting).toStrictEqual(expected);
		});
	});

	describe('Given inputs', () => {
		it('sorts by field', () => {
			const sorting = orderBy('name');
			expect(sorting).toStrictEqual({ orderBy: { name: 'asc' } });
		});

		it('uses a custom order', () => {
			const sorting = orderBy('name', 'desc');
			expect(sorting).toStrictEqual({ orderBy: { name: 'desc' } });
		});
	});
});

describe('parseId', () => {
	it('throws errors for invalid IDs', () => {
		expect(() => parseId('text')).toThrow();
	});

	it('converts IDs to integers', () => {
		const parsedId = parseId('1,7');
		expect(parsedId).toBe(1);
	});
});
