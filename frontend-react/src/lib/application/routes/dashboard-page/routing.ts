import {
	ActionFunctionArgs,
	generatePath,
	LoaderFunctionArgs,
	redirect
} from 'react-router-dom';

import { TelestionOptions } from '../../model.ts';
import { isLoggedIn } from '../../../auth';
import { getUserData, setUserData, UserData } from '../../../user-data';
import { isUserDataUpToDate } from '../../../utils.ts';

import { dashboardCreateAction } from '../dashboard.ts';
import { setResumeAfterLogin } from '../login';

export function dashboardPageLoader({ version }: TelestionOptions) {
	return ({ params }: LoaderFunctionArgs) => {
		if (!isLoggedIn()) {
			if (params.dashboardId) {
				setResumeAfterLogin(
					generatePath('/dashboards/:dashboardId', {
						dashboardId: params.dashboardId
					})
				);
			}
			return redirect('/login');
		}

		const userData = getUserData();
		if (!isUserDataUpToDate(userData, version) || !userData) {
			return redirect('/');
		}

		const dashboardId = params.dashboardId;
		if (!dashboardId) {
			throw new Error(
				`No parameter ":dashboardId" in current path found. Library error: 1e995d14`
			);
		}

		if (!(dashboardId in userData.dashboards)) {
			throw new Response(`Dashboard "${dashboardId}" does not exist`, {
				status: 404
			});
		}

		return {
			dashboard: userData.dashboards[dashboardId]
		};
	};
}

export function dashboardPageAction(options: TelestionOptions) {
	const { version } = options;

	const createAction = dashboardCreateAction(options);
	const deleteAction = ({ params }: ActionFunctionArgs) => {
		if (!isLoggedIn()) {
			return redirect('/login');
		}

		const oldUserData = getUserData();
		if (!isUserDataUpToDate(oldUserData, version) || !oldUserData) {
			return redirect('/');
		}

		const dashboardId = params.dashboardId;
		if (!dashboardId) {
			throw new Error(
				`No parameter ":dashboardId" in current path found. Library error: 1e995d14`
			);
		}

		if (!(dashboardId in oldUserData.dashboards)) {
			throw new Response(`Dashboard "${dashboardId}" does not exist`, {
				status: 404
			});
		}

		const oldDashboard = oldUserData.dashboards[dashboardId];
		const newDashboards = Object.entries(oldUserData.dashboards).filter(
			([, dashboard]) => dashboard === oldDashboard
		);

		const newUserData = {
			...oldUserData,
			dashboards: Object.fromEntries(newDashboards)
		};
		setUserData(purgeOrphanedWidgetInstances(newUserData));
		return redirect('/dashboards');
	};

	return (args: ActionFunctionArgs) => {
		console.log(args);
		if (args.request.method.toLowerCase() === 'delete') {
			return deleteAction(args);
		} else {
			return createAction();
		}
	};
}

/**
 * Checks if the widget instances are all referenced in any dashboard and removes any orphaned widget instances.
 * @param userData - the user data to check against orphaned widget instances
 */
function purgeOrphanedWidgetInstances(userData: UserData) {
	const referencedInstanceIds = new Set(
		Object.values(userData.dashboards)
			.map(dashboard => dashboard.layout.flat(2))
			.flat(1)
	);

	const newInstances = Object.entries(userData.widgetInstances).filter(([id]) =>
		referencedInstanceIds.has(id)
	);

	return {
		...userData,
		widgetInstances: Object.fromEntries(newInstances)
	};
}
