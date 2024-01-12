import { login } from './controller.ts';
import { z } from 'zod';

const AUTO_LOGIN_KEY = 'auto-login';

const autoLoginSchema = z.object({
	natsUrl: z.string(),
	username: z.string(),
	password: z.string()
});

/**
 * Attempt to auto-login using credentials stored in sessionStorage.
 *
 * The credentials will automatically be cleared if they are invalid, the
 * session ends, or {@link logout} is called.
 *
 * Credentials are automatically stored updated by {@link login} and
 * {@link logout}.
 *
 * @returns true if auto-login was successful, false otherwise
 */
export async function attemptAutoLogin(): Promise<boolean> {
	console.log('Attempting auto-login');
	const autoLogin = window.sessionStorage.getItem(AUTO_LOGIN_KEY);

	if (!autoLogin) {
		// This is perfectly normal, so don't log a warning, just return false
		return false;
	}

	const parsedAutoLoginData = autoLoginSchema.safeParse(
		JSON.parse(decrypt(autoLogin))
	);

	if (!parsedAutoLoginData.success) {
		console.warn('Invalid auto-login credentials type');
		return false;
	}

	const { natsUrl, username, password } = parsedAutoLoginData.data;

	try {
		await login(natsUrl, username, password);
		return true;
	} catch (err) {
		console.warn('Auto-login failed:', err);
		clearAutoLogin(); // credentials didn't work, so discard them
		return false;
	}
}

/**
 * @internal
 * Store auto-login credentials in sessionStorage.
 *
 * @param credentials - The credentials to store
 */
export function setAutoLoginCredentials(
	credentials: z.input<typeof autoLoginSchema>
) {
	window.sessionStorage.setItem(
		AUTO_LOGIN_KEY,
		encrypt(JSON.stringify(autoLoginSchema.parse(credentials)))
	);
}

/**
 * @internal
 * Clear auto-login credentials from sessionStorage.
 */
export function clearAutoLogin() {
	console.log('Clearing auto-login credentials');
	window.sessionStorage.removeItem(AUTO_LOGIN_KEY);
}

/**
 * @internal
 * Encrypt a string to obfuscate it in sessionStorage.
 * @param str - The string to encrypt
 * @returns The encrypted string
 *
 * @see decrypt
 */
function encrypt(str?: string) {
	return btoa(str ?? 'null');
}

/**
 * @internal
 * Decrypt a string that was obfuscated in sessionStorage.
 * @param str - The string to decrypt
 * @returns The decrypted string
 *
 * @see encrypt
 */
function decrypt(str?: string) {
	return atob(str ?? 'null');
}
