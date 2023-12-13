import { isLoggedIn } from '../../../auth';
import { generatePath, redirect } from 'react-router-dom';
import { getUserData } from '../../../user-data';
import { isUserDataUpToDate } from '../../../utils.ts';
import { TelestionOptions } from '../../model.ts';

export function dashboardIndexLoader({ currentVersion }: TelestionOptions) {
	return () => {
		if (!isLoggedIn()) {
			return redirect('/login');
		}

		const userData = getUserData();
		if (!isUserDataUpToDate(userData, currentVersion) || !userData) {
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
