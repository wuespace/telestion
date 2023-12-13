import { TelestionOptions } from '../model.ts';
import { isLoggedIn } from '../../auth';
import { generatePath, redirect } from 'react-router-dom';
import { getEmptyDashboard, getUserData, setUserData } from '../../user-data';
import { isUserDataUpToDate } from '../../utils.ts';

export function dashboardCreateAction({ currentVersion }: TelestionOptions) {
	return () => {
		if (!isLoggedIn()) {
			return redirect('/login');
		}

		const oldUserData = getUserData();
		if (!isUserDataUpToDate(oldUserData, currentVersion) || !oldUserData) {
			return redirect('/');
		}

		const [id, dashboard] = getEmptyDashboard();
		const newUserData = {
			...oldUserData,
			dashboards: {
				...oldUserData.dashboards,
				[id]: dashboard
			}
		};
		setUserData(newUserData);
		return redirect(
			generatePath('/dashboards/:dashboardId/edit', { dashboardId: id })
		);
	};
}
