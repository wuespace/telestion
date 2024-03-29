/**
 * @packageDocumentation
 *
 * This package provides the main entry point for the Telestion frontend application.
 *
 * You can initialize the application by calling the {@link initTelestion} function.
 *
 * @example
 * ```ts
 * import { initTelestion } from '@wuespace/telestion/application';
 * // or, for convenience:
 * // import { initTelestion } from '@wuespace/telestion';
 *
 * initTelestion({ ... });
 * ```
 */

// Import styles first to allow overriding bootstrap styles in CSS modules
import 'bootstrap-icons/font/bootstrap-icons.min.css';
import './index.scss';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import { registerWidgets } from '../widget';
import { TelestionOptions } from './model.ts';
import { createTelestionRouter } from './telestion-router.tsx';

export * from './model.ts';
export * from './hooks';

/**
 * Initialize the Telestion application.
 * @param options - The options for initializing the application.
 * @returns A Promise that resolves once the initialization is completed.
 */
export async function initTelestion(options: TelestionOptions) {
	// override default current version
	if (options.defaultUserData) {
		options.defaultUserData.version = options.version;
	}

	if (options.widgets) {
		registerWidgets(...options.widgets);
	}

	const router = createTelestionRouter(options);

	const element = document.getElementById('root');
	if (!element) {
		throw new Error(
			'Root element not found. Please create a "div" HTML element with the id "root" and try again.'
		);
	}

	ReactDOM.createRoot(element).render(
		<React.StrictMode>
			<RouterProvider router={router} />
		</React.StrictMode>
	);

	await Promise.resolve(); // function is async for future use
}

declare module 'react' {
	// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
	interface CSSProperties {
		[key: `--${string}`]: string | number;
	}
}
