import { z } from 'zod';
import { getUser } from '../auth';
import { userDataSchema } from './model.ts';

/**
 * Retrieves user data from local storage.
 *
 * @returns The user data if found in local storage, otherwise undefined.
 */
// TODO: Cache return value
export function getUserData() {
	const user = getUser();

	if (!user) {
		return undefined;
	}

	const storedData = localStorage.getItem(
		`userdata-${user.username}-${user.natsUrl}`
	);
	if (!storedData) {
		return undefined;
	}

	try {
		return userDataSchema.parse(JSON.parse(storedData));
	} catch (err) {
		// don't throw to trigger no data user flow
		console.warn('Cannot parse or validate locally stored user data.');
		return undefined;
	}
}

/**
 * Removes the user data from local storage.
 */
export function removeUserData() {
	const user = getUser();

	if (!user) {
		throw new Error('Cannot set user data without logged in user.');
	}

	localStorage.removeItem(`userdata-${user.username}-${user.natsUrl}`);
}

/**
 * Sets the user data in the local storage based on the given input.
 *
 * @param newUserData - The new user data to be set.
 */
export function setUserData(newUserData: z.input<typeof userDataSchema>) {
	const user = getUser();

	if (!user) {
		throw new Error('Cannot set user data without logged in user.');
	}

	const validatedUserData = userDataSchema.parse(newUserData);
	localStorage.setItem(
		`userdata-${user.username}-${user.natsUrl}`,
		JSON.stringify(validatedUserData)
	);
}
