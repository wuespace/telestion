import { isLoggedIn } from '../../../auth';
import { generatePath, redirect } from 'react-router-dom';
import { getUserData } from '../../../user-data';
import { isUserDataUpToDate } from '../../../utils';
import { TelestionOptions } from '../../model.ts';

export function dashboardIndexLoader({ version }: TelestionOptions) {
	return () => {
		if (!isLoggedIn()) {
			return redirect('/login');
		}

		const userData = getUserData();
		if (!isUserDataUpToDate(userData, version) || !userData) {
			return redirect('/');
		}

		const dashboardIds = Object.keys(userData.dashboards);
		if (dashboardIds.length) {
			return redirect(
				generatePath('/dashboards/:dashboardId', {
					dashboardId: dashboardIds[0]
				})
			);
		}

		return {};
	};
}
