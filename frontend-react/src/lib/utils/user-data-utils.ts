import { UserData } from '@wuespace/telestion';

/**
 * Generates a unique identifier for a dashboard.
 *
 * @returns The generated dashboard identifier.
 */
export function generateDashboardId(): string {
	return Math.floor(Date.now()).toString(32);
}

/**
 * Checks if the user data is up-to-date with the current version of the application.
 * @param userData - the user data to compare with the application version
 * @param currentVersion - the current version of the application
 */
export function isUserDataUpToDate(
	userData: UserData | undefined,
	currentVersion: string
) {
	return !!userData && userData.version === currentVersion;
}
