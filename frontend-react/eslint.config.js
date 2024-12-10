import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginPrettier from 'eslint-plugin-prettier/recommended';
import pluginJsxA11y from 'eslint-plugin-jsx-a11y';
import pluginTsDoc from 'eslint-plugin-tsdoc';

const TS_CONFIG = [
	...tseslint.configs.strictTypeChecked,
	...tseslint.configs.stylisticTypeChecked,
	{
		languageOptions: {
			parserOptions: {
				// projectService: true,
				project: ['./tsconfig.json', './tsconfig.node.json'],
				tsconfigRootDir: import.meta.dirname
			}
		}
	},
	{
		rules: {
			'@typescript-eslint/no-throw-literal': 'off',
			'@typescript-eslint/no-confusing-void-expression': 'off',
			'@typescript-eslint/consistent-type-definitions': 'off'
		}
	}
];

const REACT_CONFIG = [
	pluginReact.configs.flat.recommended,
	pluginReact.configs.flat['jsx-runtime'],
	{
		rules: {
			'react/no-unescaped-entities': 'off'
		}
	},
	{
		settings: {
			react: {
				version: 'detect'
			}
		}
	}, // eslint-plugin-react-hooks:
	{
		files: ['src/**/*.{js,ts,jsx,tsx}'],
		plugins: {
			'react-hooks': pluginReactHooks
		},
		rules: {
			'react/react-in-jsx-scope': 'off',
			'react/prop-types': 'off',
			...pluginReactHooks.configs.recommended.rules
		}
	}
];

/** @type {import('eslint').Linter.Config[]} */
export default [
	{
		files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}']
	},
	{
		languageOptions: {
			globals: {
				...globals.browser
			}
		}
	},
	pluginJs.configs.recommended,
	...TS_CONFIG,
	...REACT_CONFIG,
	pluginPrettier,
	pluginJsxA11y.flatConfigs.strict,
	{
		plugins: {
			tsdoc: pluginTsDoc
		},
		rules: {
			'tsdoc/syntax': 'warn'
		}
	},
	{
		ignores: ['dist', 'types', 'node_modules', 'features', 'eslint.config.js']
	}
];
