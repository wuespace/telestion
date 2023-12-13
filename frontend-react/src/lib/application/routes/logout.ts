import { redirect } from 'react-router-dom';
import { isLoggedIn, logout } from '../../auth';
import { wait } from '../../utils.ts';

export function logoutLoader() {
	return async () => {
		if (!isLoggedIn()) {
			return redirect('/login');
		}

		await Promise.all([logout(), wait(500)]);
		return redirect('/login');
	};
}
