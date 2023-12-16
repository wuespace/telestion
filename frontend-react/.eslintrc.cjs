module.exports = {
	root: true,
	env: { browser: true, es2020: true },
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:@typescript-eslint/strict-type-checked',
		'plugin:@typescript-eslint/stylistic-type-checked',
		'plugin:react/recommended',
		'plugin:react/jsx-runtime',
		'plugin:react-hooks/recommended',
		'plugin:prettier/recommended',
		'plugin:jsx-a11y/strict'
	],
	parserOptions: {
		ecmaFeatures: { jsx: true },
		ecmaVersion: 'latest',
		sourceType: 'module',
		project: ['./tsconfig.json', './tsconfig.node.json'],
		tsconfigRootDir: __dirname
	},
	ignorePatterns: [
		'dist',
		'.eslintrc.cjs',
		'types',
		'node_modules',
		'features'
	],
	parser: '@typescript-eslint/parser',
	plugins: ['eslint-plugin-tsdoc'],
	// plugins: ['react-refresh'],
	rules: {
		'react/no-unescaped-entities': 'off',
		// 'react-refresh/only-export-components': 'off',
		'@typescript-eslint/no-throw-literal': 'off',
		'@typescript-eslint/no-confusing-void-expression': 'off',
		'@typescript-eslint/consistent-type-definitions': 'off',
		'tsdoc/syntax': 'warn'
	},
	settings: {
		react: { version: 'detect' }
	}
};
