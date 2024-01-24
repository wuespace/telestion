import { z } from 'zod';
import { generateDashboardId } from '../utils';
import { jsonSchema } from './json-schema.ts';

/**
 * A regular expression that matches semantic version numbers.
 *
 * Taken from https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
 */
export const semverRegExp =
	/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
/**
 * A regular expression that matches valid identifiers.
 *
 * Used for dashboard and widget instance IDs.
 *
 * @see {@link WidgetInstance}
 */
export const idSchema = z.string();
/**
 * A schema that matches valid layout configurations.
 */
export const layoutSchema = z.array(
	z.array(z.union([idSchema, z.literal('.')]))
);
/**
 * Represents the schema for a dashboard.
 */
export const dashboardSchema = z.object({
	/**
	 * The title of the dashboard.
	 */
	title: z.string(),
	/**
	 * The layout of the dashboard.
	 */
	layout: layoutSchema
});

/**
 * Represents the schema for a widget instance.
 *
 * @see {@link WidgetInstance}
 */
export const widgetInstanceSchema = z.object({
	/**
	 * The configuration of the widget.
	 */
	configuration: z.record(z.string(), jsonSchema),
	/**
	 * The type ID of the widget.
	 *
	 *
	 * This is used to determine which widget type to use to render the widget.
	 *
	 * @see {@link Widget.id}
	 */
	type: z.string()
});
/**
 * The schema for the user data.
 *
 * @see {@link UserData}
 */
export const userDataSchema = z.object({
	/**
	 * The version of the client that created this user data.
	 */
	version: z.string().regex(semverRegExp),
	/**
	 * The user's dashboards.
	 */
	dashboards: z.record(idSchema, dashboardSchema),
	/**
	 * The user's widget instances.
	 */
	widgetInstances: z.record(idSchema, widgetInstanceSchema)
});
/**
 * Represents the user data.
 *
 * @see {@link userDataSchema}
 */
export type UserData = z.infer<typeof userDataSchema>;
/**
 * Represents a dashboard.
 *
 * @see {@link dashboardSchema}
 *
 * @alpha
 */
export type Dashboard = z.infer<typeof dashboardSchema>;
/**
 * Represents a widget instance.
 *
 * @see {@link widgetInstanceSchema}
 */
export type WidgetInstance = z.infer<typeof widgetInstanceSchema>;

/**
 * Returns a new and empty dashboard with a unique id.
 */
export function getEmptyDashboard(): readonly [
	id: string,
	dashboard: Dashboard
] {
	const id = generateDashboardId();
	return [
		id,
		{
			title: `Untitled (${new Date().toLocaleString()})`,
			layout: [
				['.', '.'],
				['.', '.']
			]
		}
	];
}

/**
 * Returns a new blank user data object.
 * @param version - the current application version
 */
export function getBlankUserData(version: string): UserData {
	const [id, dashboard] = getEmptyDashboard();
	return {
		version,
		dashboards: {
			[id]: dashboard
		},
		widgetInstances: {}
	};
}
