/**
 * A logged-in user.
 */
export interface User {
	/**
	 * The user's username.
	 */
	username: string;
	/**
	 * The NATS URL that the user is connected to.
	 */
	natsUrl: string;
}

export interface ErrorMessages {
	natsUrlMessage?: string;
	usernameMessage?: string;
	passwordMessage?: string;
}

export class LoginError extends Error {
	public messages: ErrorMessages;

	constructor(messages: ErrorMessages) {
		super(
			`Login validation errors: ${[
				messages.natsUrlMessage,
				messages.usernameMessage,
				messages.passwordMessage
			]
				.filter(Boolean)
				.join(', ')}`
		);
		this.name = 'LoginError';
		this.messages = messages;
	}
}
