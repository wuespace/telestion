import {
	ActionFunctionArgs,
	generatePath,
	LoaderFunctionArgs,
	redirect
} from 'react-router-dom';
import { isLoggedIn } from '../../../auth';
import {
	getUserData,
	layoutSchema,
	setUserData,
	UserData
} from '../../../user-data';
import { isUserDataUpToDate } from '../../../utils.ts';
import { TelestionOptions } from '../../model.ts';
import { setResumeAfterLogin } from '../login';

export function dashboardEditorLoader({ version }: TelestionOptions) {
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
				`No parameter ":dashboardId" in current path found. Library error: 1251c84a`
			);
		}

		if (!(dashboardId in userData.dashboards)) {
			throw new Response(`Dashboard "${dashboardId}" does not exist`, {
				status: 404
			});
		}

		return {
			dashboardId,
			dashboard: userData.dashboards[dashboardId]
		};
	};
}

export function dashboardEditorAction({ version }: TelestionOptions) {
	return async ({ request, params }: ActionFunctionArgs) => {
		if (!isLoggedIn()) {
			return redirect('/login');
		}

		const userData = getUserData();
		if (!isUserDataUpToDate(userData, version) || !userData) {
			return redirect('/');
		}

		const dashboardId = params.dashboardId;
		if (!dashboardId) {
			throw new Error(
				`No parameter ":dashboardId" in current path found. Library error: 0cb1164b`
			);
		}

		if (!(dashboardId in userData.dashboards)) {
			throw new Response(`Dashboard "${dashboardId}" does not exist`, {
				status: 404
			});
		}

		const formData = await request.formData();
		const rawNewLayout = formData.get('layout');
		if (typeof rawNewLayout !== 'string') {
			throw new Error('No layout given');
		}

		try {
			const newLayout = layoutSchema.parse(JSON.parse(rawNewLayout));
			const dashboard = userData.dashboards[dashboardId];

			const newUserData: UserData = {
				...userData,
				dashboards: {
					...userData.dashboards,
					[dashboardId]: {
						...dashboard,
						layout: newLayout
					}
				}
			};
			setUserData(newUserData);
			return redirect(
				generatePath('/dashboards/:dashboardId', { dashboardId })
			);
		} catch (err) {
			const errors: Record<string, string> = {};

			if (err instanceof Error) {
				errors.layout = err.message;
			} else {
				errors.layout = JSON.stringify(err);
			}

			return { errors };
		}
	};
}
