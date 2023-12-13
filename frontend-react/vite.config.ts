/// <reference types="vitest" />
import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

import packageJson from './package.json' assert { type: 'json' };

// https://vitejs.dev/config/
export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, 'src/lib/index.ts'),
			name: 'Telestion',
			fileName: 'telestion'
		},
		sourcemap: true,
		rollupOptions: {
			external: Object.keys(packageJson.dependencies),
			output: {
				globals: {
					react: 'React'
				}
			}
		}
	},
	plugins: [react()],
	test: {
		environment: 'happy-dom'
	}
});
