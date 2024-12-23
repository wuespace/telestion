import { ActionFunctionArgs, generatePath, redirect } from 'react-router-dom';

import { isLoggedIn } from '../../../auth';
import { isUserDataUpToDate, loadFileContents } from '../../../utils';
import {
	getBlankUserData,
	getUserData,
	setUserData,
	UserData,
	userDataSchema,
	WidgetInstance
} from '../../../user-data';
import { TelestionOptions } from '../../model.ts';
import { getWidgetById } from '../../../widget';
import { promptActionSchema } from './model.ts';

export function migrationLoader({
	version,
	defaultUserData
}: TelestionOptions) {
	return () => {
		if (!isLoggedIn()) {
			return redirect('/login');
		}

		const userData = getUserData();
		if (isUserDataUpToDate(userData, version)) {
			return redirect('/');
		}

		return {
			migrationState: userData
				? {
						previousVersion: userData.version,
						currentVersion: version,
						oldUserData: userData
					}
				: undefined,
			isDefaultAvailable: !!defaultUserData
		};
	};
}

export function migrationAction({
	defaultUserData,
	version
}: TelestionOptions) {
	return async ({ request }: ActionFunctionArgs) => {
		if (!isLoggedIn()) {
			return redirect('/login');
		}

		const formData = await request.formData();
		const rawAction = formData.get('action');
		const action = promptActionSchema.parse(rawAction);
		const errors: Record<string, string> = {};

		switch (action) {
			case 'default':
				if (!defaultUserData) {
					throw new Error(
						'Undefined default user data. Library error: 0b321d33'
					);
				}

				setUserData(defaultUserData);
				return redirect('/');
			case 'import':
				try {
					const userData = await parseUserData(formData.get('userdata'));
					setUserData(userData);
					return redirect('/');
				} catch (err) {
					if (err instanceof Error) {
						errors.import = err.message;
					} else {
						errors.import = JSON.stringify(err);
					}

					return { errors };
				}

			case 'blank': {
				const blankUserData = getBlankUserData(version);
				const dashboardId = Object.keys(blankUserData.dashboards)[0];
				setUserData(blankUserData);
				return redirect(
					generatePath('/dashboards/:dashboardId/edit', {
						dashboardId
					})
				);
			}
			case 'existing': {
				const oldUserData = getUserData();
				if (!oldUserData) {
					throw new Error('Undefined user data. Library error: 03b03e04');
				}

				const newInstances = Object.entries(oldUserData.widgetInstances)
					.map(migrateWidgetConfig)
					.filter(
						(entry): entry is [id: string, instance: WidgetInstance] => !!entry
					);

				const availableWidgetInstances = new Set(
					newInstances.map(([widgetInstanceId]) => widgetInstanceId)
				);

				// filter dashboard layouts for no longer existing widgets
				const newDashboards = Object.entries(oldUserData.dashboards).map(
					dashboardTuple =>
						migrateDashboardConfig(dashboardTuple, availableWidgetInstances)
				);

				setUserData({
					...oldUserData,
					version: version,
					dashboards: {
						...Object.fromEntries(newDashboards)
					},
					widgetInstances: {
						...Object.fromEntries(newInstances)
					}
				});

				return redirect('/');
			}
		}
	};
}

/**
 * Parses the form data entry into a user data object.
 * @param entry - The form data entry value.
 * @returns The parsed user data object.
 */
async function parseUserData(
	entry: FormDataEntryValue | null
): Promise<UserData> {
	let rawUserData: string | null;
	if (entry instanceof File) {
		rawUserData = await loadFileContents(entry);
	} else {
		rawUserData = entry;
	}

	if (!rawUserData) {
		throw new Error('Missing user data.');
	}

	return userDataSchema.parse(JSON.parse(rawUserData));
}

/**
 * Accepts a tuple of a dashboard id and the associated dashboard and performs a
 * dashboard configuration migration by replacing all widget ids that are no
 * longer registered with a dot (i.e., empty space).
 * @param id - the id of the dashboard
 * @param dashboard - the dashboard with the outdated widget ids
 * @param availableWidgetInstances - a set of all available widget instance ids
 * @returns a tuple of a dashboard with an up-to-date widget configuration
 */
function migrateDashboardConfig(
	[id, dashboard]: [string, UserData['dashboards'][string]],
	availableWidgetInstances: Set<string>
): [string, UserData['dashboards'][string]] {
	return [
		id,
		{
			...dashboard,
			layout: dashboard.layout.map(row =>
				row.map(widgetInstanceId => {
					if (widgetInstanceId === '.') {
						return '.';
					}

					if (!availableWidgetInstances.has(widgetInstanceId)) {
						console.warn(
							`Widget with id "${widgetInstanceId}" not found. Replacing with "."`
						);

						return '.';
					}

					return widgetInstanceId;
				})
			)
		}
	];
}

/**
 * Accepts a tuple of a widget instance and the associated id and performs a
 * widget configuration migration via the widget's {@link createConfig} function.
 * If the widget instance references a widget that is no longer registered
 * `undefined` is returned instead.
 *
 * @param id - the id of the widget instance
 * @param instance - the widget instance with the outdated widget configuration
 * @returns a tuple of a widget instance with an up-to-date widget configuration
 * or `undefined` if the referenced widget is no longer registered
 */
function migrateWidgetConfig([id, instance]: [
	id: string,
	instance: WidgetInstance
]) {
	const widget = getWidgetById(instance.type);
	if (!widget) {
		return undefined;
	}

	return [
		id,
		{
			...instance,
			configuration: widget.createConfig(instance.configuration)
		}
	];
}
