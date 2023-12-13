import { User } from './model.ts';
import { NatsConnection } from 'nats.ws';

let currentUser: User | null = null;
let currentNc: NatsConnection | null = null;

/**
 * Sets a new user object or `null` if the user is no longer logged in.
 *
 * @param user - the user object or `null`
 */
export function setUser(user: User | null) {
	currentUser = user;
}

/**
 * Returns the user object if the user is currently logged in, else returns `null` if no user is currently logged in.
 */
export function getUser() {
	return currentUser;
}

export function setNatsConnection(nc: NatsConnection | null) {
	currentNc = nc;
}

export function getNatsConnection() {
	return currentNc;
}
