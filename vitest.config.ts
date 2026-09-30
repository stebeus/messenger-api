/** biome-ignore-all assist/source/useSortedKeys: custom order */

import { defineConfig } from 'vitest/config';

// https://vitest.dev/config/
export default defineConfig({
	test: {
		root: 'src',
		projects: [
			{
				test: {
					name: 'unit',
					include: ['**/*.test.ts'],
					exclude: ['**/tests/routes/**.test.ts', '**/routes.test.ts'],
					sequence: {
						groupOrder: 1,
					},
				},
			},
			{
				test: {
					name: 'integration',
					include: ['**/tests/routes/**.test.ts', '**/routes.test.ts'],
					fileParallelism: false,
					sequence: {
						groupOrder: 2,
					},
				},
			},
		],
	},
});
