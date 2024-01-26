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
	UserData,
	widgetInstanceSchema
} from '../../../user-data';
import { isUserDataUpToDate } from '../../../utils';
import { TelestionOptions } from '../../model.ts';
import { resetResumeAfterLogin, setResumeAfterLogin } from '../login';
import { z } from 'zod';

export function dashboardEditorLoader({ version }: TelestionOptions) {
	return ({ params }: LoaderFunctionArgs) => {
		if (!isLoggedIn()) {
			if (params.dashboardId) {
				setResumeAfterLogin(
					generatePath('/dashboards/:dashboardId/edit', {
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
			dashboard: userData.dashboards[dashboardId],
			widgetInstances: userData.widgetInstances
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

		switch (request.method) {
			case 'POST':
			case 'PUT':
				return editDashboard(request, userData, dashboardId);
			case 'DELETE':
				return deleteDashboard(userData, dashboardId);
			default:
				throw new Response(`Method "${request.method}" not allowed`, {
					status: 405
				}) as never;
		}
	};
}

async function editDashboard(
	request: Request,
	userData: UserData,
	dashboardId: string
) {
	const formData = await request.formData();
	const rawNewLayout = formData.get('layout');
	if (typeof rawNewLayout !== 'string') {
		throw new Error('No layout given');
	}

	const rawNewWidgetInstances = formData.get('widgetInstances');
	if (typeof rawNewWidgetInstances !== 'string') {
		throw new Error('No widgetInstances given');
	}

	const rawNewTitle = formData.get('title');
	if (typeof rawNewTitle !== 'string') {
		throw new Error('No title given');
	}

	try {
		const newLayout = layoutSchema.parse(JSON.parse(rawNewLayout));
		const newWidgetInstances = z
			.record(z.string(), widgetInstanceSchema)
			.parse(JSON.parse(rawNewWidgetInstances));
		const newTitle = z.string().parse(rawNewTitle);
		const dashboard = userData.dashboards[dashboardId];

		const newUserData: UserData = {
			...userData,
			dashboards: {
				...userData.dashboards,
				[dashboardId]: {
					...dashboard,
					layout: newLayout,
					title: newTitle
				}
			},
			widgetInstances: {
				...userData.widgetInstances,
				...newWidgetInstances
			}
		};
		setUserData(newUserData);
		return redirect(generatePath('/dashboards/:dashboardId', { dashboardId }));
	} catch (err) {
		const errors: Record<string, string> = {};

		if (err instanceof Error) {
			errors.layout = err.message;
		} else {
			errors.layout = JSON.stringify(err);
		}

		return { errors };
	}
}

function deleteDashboard(userData: UserData, dashboardId: string) {
	const newUserData: UserData = {
		...userData,
		dashboards: {
			...Object.fromEntries(
				Object.entries(userData.dashboards).filter(([id]) => id !== dashboardId)
			)
		}
	};
	console.debug(`Deleted dashboard "${dashboardId}"`, newUserData);
	setUserData(newUserData);
	resetResumeAfterLogin();
	return redirect('/');
}
