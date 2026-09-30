/** biome-ignore-all assist/source/useSortedKeys: custom order */

import { defineConfig } from 'vitest/config';

// https://vitest.dev/config/
export default defineConfig({
	test: {
		env: {
			NODE_ENV: 'test',
		},
		projects: [
			{
				test: {
					name: 'unit',
					include: ['src/**/*.test.ts'],
					exclude: ['src/**/tests/routes/**.test.ts', 'src/**/routes.test.ts'],
					sequence: {
						groupOrder: 1,
					},
				},
			},
			{
				test: {
					name: 'integration',
					include: ['src/**/tests/routes/**.test.ts', 'src/**/routes.test.ts'],
					fileParallelism: false,
					sequence: {
						groupOrder: 2,
					},
				},
			},
		],
	},
});
