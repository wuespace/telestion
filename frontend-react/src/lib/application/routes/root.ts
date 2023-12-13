import { redirect } from 'react-router-dom';

import { isLoggedIn } from '../../auth';
import { getUserData } from '../../user-data';
import { isUserDataUpToDate } from '../../utils.ts';
import { TelestionOptions } from '../model.ts';

export function rootLoader({ version }: TelestionOptions) {
	return () => {
		if (!isLoggedIn()) {
			return redirect('/login');
		}

		const userData = getUserData();
		if (!isUserDataUpToDate(userData, version)) {
			return redirect('/migration');
		}

		return redirect('/dashboards');
	};
}
