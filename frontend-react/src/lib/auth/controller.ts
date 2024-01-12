import {
	getNatsConnection,
	getUser,
	setNatsConnection,
	setUser
} from './state.ts';
import { LoginError, ErrorMessages } from './model.ts';
import { connect, NatsError } from 'nats.ws';
import { z } from 'zod';
import { clearAutoLogin, setAutoLoginCredentials } from './auto-login.ts';

const natsUrlSchema = z.string().url();
const credentialsSchema = z.string().min(1).max(800);

/**
 * Logs in a user with the given credentials.
 *
 * @param natsUrl - The url to connect to the NATS server.
 * @param username - The username for authentication.
 * @param password - The password for authentication.
 *
 * @returns A promise that resolves once the user is logged in.
 * The resolved value is the logged-in user object.
 *
 * @throws Error If the provided credentials are incorrect.
 */
export async function login(
	natsUrl: string,
	username: string,
	password: string
) {
	if (isLoggedIn()) {
		console.log('Already logged in');
		return getUser();
	}

	// validation
	const errorMessages: ErrorMessages = {};

	try {
		natsUrl = natsUrlSchema.parse(natsUrl);
	} catch (err) {
		errorMessages.natsUrlMessage = 'Invalid backend URL';
	}

	try {
		username = credentialsSchema.parse(username);
	} catch (err) {
		errorMessages.usernameMessage = 'User does not exist';
	}

	try {
		password = credentialsSchema.parse(password);
	} catch (err) {
		errorMessages.passwordMessage = 'Invalid password';
	}

	if (Object.keys(errorMessages).length) {
		console.log('The following errors were detected:', errorMessages);
		throw new LoginError(errorMessages);
	}

	// user credentials correct

	try {
		console.log(
			'Log in with nats url:',
			natsUrl,
			', username:',
			username,
			', password:',
			password
		);

		const nc = await connect({
			servers: natsUrl,
			name: `frontend-${username}`,
			user: username,
			pass: password
		});

		setUser({ natsUrl, username });
		setNatsConnection(nc);

		setAutoLoginCredentials({
			natsUrl,
			username,
			password: password
		});

		console.log('Successfully logged in');
		return getUser();
	} catch (err) {
		if (err instanceof NatsError) {
			throw new Error(
				'Login failed. Please check your connection and credentials, then try again'
			);
		}

		throw err;
	}
}

/**
 * Logs out the user if currently logged in.
 *
 * @returns A promise that resolves once the user is logged out.
 */
export async function logout() {
	clearAutoLogin();

	if (!isLoggedIn()) {
		console.log('Already logged out');
		return;
	}

	console.log('Log out');

	const nc = getNatsConnection();
	if (nc) {
		await nc.drain();
		await nc.close();
		setNatsConnection(null);
	}

	console.log('Successfully logged out');
	setUser(null);
}

/**
 * Checks if a user is logged in.
 *
 * @returns `true` if the user is logged in, `false` otherwise.
 */
export function isLoggedIn() {
	return !!getUser();
}
