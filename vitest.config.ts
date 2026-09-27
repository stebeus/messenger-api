import { defineConfig } from 'vitest/config';

// https://vitest.dev/config/
export default defineConfig({
	test: {
		fileParallelism: false,
	},
});
