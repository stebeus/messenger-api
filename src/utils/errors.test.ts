import { describe, expect, it } from 'vitest';

import { catchError, HttpError } from './errors.ts';

describe('HttpError.isHttpError', () => {
	it('confirms that it is not an HTTP error', () => {
		const error = new Error();
		expect(HttpError.isHttpError(error)).toBeFalsy();
	});

	it('confirms that it is an HTTP error', () => {
		const error = new HttpError();
		expect(HttpError.isHttpError(error)).toBeTruthy();
	});
});

describe('catchError', () => {
	describe.for`
		scenario     | value               | expected
		${'numbers'} | ${0}                | ${'0'}
		${'strings'} | ${'string'}         | ${'"string"'}
		${'bigints'} | ${1n}               | ${'[Non-serializable value]'}
		${'objects'} | ${{ key: 'value' }} | ${'{\n\t"key": "value"\n}'}
	`('Given $scenario', ({ value, expected }) => {
		it('creates errors for them', () => {
			const caught = catchError(value);
			expect(caught).toBeInstanceOf(Error);
		});

		it('describes them as unexpected throws', () => {
			const { message } = catchError(value);
			expect(message).toBe(`Unexpected throw: ${expected}`);
		});
	});

	it('preserves errors', () => {
		// Arrange
		const error = new Error();

		// Act
		const caught = catchError(error);

		// Assert
		expect(caught).toBe(error);
	});
});
