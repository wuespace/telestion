import { redirect } from 'react-router-dom';
import { isLoggedIn, logout } from '../../auth';
import { wait } from '../../utils';
import { resetResumeAfterLogin } from './login';

export function logoutLoader() {
	return async () => {
		if (!isLoggedIn()) {
			return redirect('/login');
		}

		await Promise.all([logout(), wait(500)]);
		resetResumeAfterLogin();
		return redirect('/login');
	};
}
