/**
 * @packageDocumentation
 *
 * Functions and types relating to the authentication of users in the Telestion frontend.
 *
 * Note that in most cases, you don't need to import anything from this package directly, since auth*n is already
 * handled by the framework itself.
 *
 * @example
 * ```tsx
 * import { ... } from '@wuespace/telestion/auth';
 * ```
 */
export * from './model.ts';
export * from './state.ts';
export * from './controller.ts';
export { attemptAutoLogin, setAutoLoginCredentials } from './auto-login.ts';
export * from './hooks';
