import { UserData } from './user-data';

/**
 * Waits for the specified amount of time before resolving the returned promise.
 *
 * @param timeout - The duration in milliseconds to wait before resolving.
 * @returns A promise that resolves after the specified time has elapsed.
 * @internal
 */
export function wait(timeout: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, timeout));
}

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

/**
 * Loads the contents of a specified file.
 *
 * @param file - The file object to load contents from.
 * @param encoding - The encoding to use while reading the file. Default is UTF-8.
 *
 * @returns - A Promise that resolves with the contents of the file as a string.
 *          - If the file is empty, the Promise will be rejected with an error.
 */
export function loadFileContents(
	file: File,
	encoding = 'utf-8'
): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.addEventListener('load', () => {
			if (reader.result) {
				if (typeof reader.result !== 'string')
					// ArrayBuffer
					return resolve(new TextDecoder(encoding).decode(reader.result));

				resolve(reader.result.toString());
			} else {
				reject(
					new Error('Empty file specified. Please select a non-empty file.')
				);
			}
		});
		reader.addEventListener('error', reject);
		reader.readAsText(file, encoding);
	});
}
