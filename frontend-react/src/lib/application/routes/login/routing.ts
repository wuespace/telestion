import { ActionFunctionArgs, redirect } from 'react-router-dom';
import { attemptAutoLogin, isLoggedIn, login, LoginError } from '../../../auth';
import { TelestionOptions } from '../../model.ts';
import { wait } from '../../../utils.ts';

let resumeAfterLogin: string | undefined = undefined;

/**
 * Sets a URL that the login action redirects after the user has logged in.
 * @param url - the url the login action redirects after the user login
 */
export function setResumeAfterLogin(url: string) {
	resumeAfterLogin = url;
}

/**
 * Resets the url the login action redirects after the user has logged in.
 */
export function resetResumeAfterLogin() {
	resumeAfterLogin = undefined;
}

export function loginLoader({ defaultBackendUrl }: TelestionOptions) {
	return async () => {
		if (isLoggedIn()) {
			return redirect('/');
		}

		// try to log in with the credentials from the session storage
		if (await attemptAutoLogin()) return redirect(resumeAfterLogin ?? '/');

		// show the login form
		return {
			defaultBackendUrl
		};
	};
}

export function loginAction() {
	return async ({ request }: ActionFunctionArgs) => {
		const formData = await request.formData();
		const errors: Record<string, string | undefined> = {};

		let natsUrl = formData.get('natsUrl');
		if (typeof natsUrl !== 'string' || !natsUrl.length) {
			errors.natsUrl = 'Please enter a valid nats server url';
			natsUrl = '';
		}

		let username = formData.get('username');
		if (typeof username !== 'string' || !username.length) {
			errors.username = 'Please enter a valid username';
			username = '';
		}

		const password = formData.get('password');
		if (typeof password !== 'string' || !password.length) {
			errors.password = 'Please enter a valid password';
		}

		if (Object.keys(errors).length) {
			return {
				errors,
				values: {
					natsUrl,
					username
				}
			};
		}

		try {
			await Promise.all([
				login(natsUrl, username, password as string),
				wait(500)
			]);
			console.log('Resume after login url:', resumeAfterLogin);
			return redirect(resumeAfterLogin ?? '/');
		} catch (err) {
			console.error(err);
			if (err instanceof LoginError) {
				errors.natsUrl = err.messages.natsUrlMessage;
				errors.username = err.messages.usernameMessage;
				errors.password = err.messages.passwordMessage;
			} else if (err instanceof Error) {
				errors.general = err.message;
			} else {
				errors.general = JSON.stringify(err);
			}

			return {
				errors,
				values: {
					natsUrl,
					username
				}
			};
		}
	};
}
