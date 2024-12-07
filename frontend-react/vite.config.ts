/// <reference types="vitest" />
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import banner from 'vite-plugin-banner';

import packageJson from './package.json' with { type: 'json' };

const bannerText = {
	name: packageJson.name,
	version: packageJson.version,
	description: packageJson.description,
	author: `${packageJson.author.name} <${packageJson.author.email}>`,
	homepage: packageJson.homepage,
	license: 'MIT. Copyright (c) 2023 WüSpace e. V.'
};

// https://vitejs.dev/config/
export default defineConfig({
	build: {
		lib: {
			entry: [
				resolve(__dirname, 'src/lib/index.ts'),
				resolve(__dirname, 'src/lib/mod-application.ts'),
				resolve(__dirname, 'src/lib/mod-auth.ts'),
				resolve(__dirname, 'src/lib/mod-nats.ts'),
				resolve(__dirname, 'src/lib/mod-user-data.ts'),
				resolve(__dirname, 'src/lib/mod-utils.ts'),
				resolve(__dirname, 'src/lib/mod-widget.ts')
			],
			name: 'Telestion',
			fileName: (format, entryName) =>
				`${entryName}.${format === 'cjs' ? 'cjs' : 'js'}`
		},
		sourcemap: true,
		rollupOptions: {
			external: Object.keys({
				...packageJson.dependencies,
				...packageJson.peerDependencies
			}),
			output: {
				globals: {
					react: 'React'
				}
			}
		}
	},
	resolve: {
		alias: {
			'@wuespace/telestion': resolve(__dirname, 'src/lib')
		}
	},
	plugins: [react(), banner(transformBanner(bannerText))],
	test: {
		environment: 'happy-dom'
	}
});

function transformBanner(banner: Record<string, string>) {
	return (
		'/**\n' +
		Object.entries(banner)
			.map(([key, value]) => ` * ${key}: ${value}\n`)
			.join('') +
		'**/'
	);
}
