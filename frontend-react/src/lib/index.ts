/**
 * @packageDocumentation
 *
 * The Telestion Frontend Library.
 *
 * Import this library to use the Telestion Frontend:
 *
 * ```ts
 * import { initTelestion } from '@wuespace/telestion';
 * ```
 *
 * The most important function is {@link initTelestion}.
 * It initializes the Telestion Frontend and renders the application.
 *
 * ```ts
 * initTelestion({
 *   version: '1.0.0',
 *   ...
 * });
 * ```
 *
 * @see {@link initTelestion}
 */

// application
export { initTelestion, useWidgetConfig } from './application';
export type { TelestionOptions } from './application';

// widgets
export { registerWidgets } from './widget';
export type { Widget } from './widget';

// user data
export type { UserData } from './user-data';

// auth
export { useNats } from './auth';

// nats
export { JSONCodec } from './nats';
