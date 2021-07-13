// @ts-check
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
	return {
		base: '',
		plugins: [svelte()],
		optimizeDeps: {
			exclude: ['@beyonk/svelte-notifications'],
		},
	};
});
