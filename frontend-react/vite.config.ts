/// <reference types="vitest" />
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import banner from 'vite-plugin-banner';

import packageJson from './package.json' assert { type: 'json' };

const bannerText = {
	name: packageJson.name,
	version: packageJson.version,
	description: packageJson.description,
	author: `${packageJson.author.name} <${packageJson.author.email}>`,
	homepage: packageJson.homepage,
	license: 'Copyright (c) 2023 WüSpace e. V.'
};

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
	plugins: [react(), banner(transformBanner(bannerText))],
	test: {
		environment: 'happy-dom'
	}
});

function transformBanner(banner: Record<string, string>) {
	return '/**\n' + Object.entries(banner).map(([key, value]) => ` * ${key}: ${value}\n`).join('') + '**/';
}
