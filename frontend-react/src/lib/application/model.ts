import { UserData } from '../user-data';
import { Widget } from '../widget';

/**
 * Represents the options for Telestion.
 */
export interface TelestionOptions {
	/**
	 * Represents the current version of the software.
	 */
	currentVersion: string;
	/**
	 * The backend URL that should be inserted by default on first page load.
	 */
	defaultBackendUrl?: string;
	/**
	 * Represents the default user data.
	 */
	defaultUserData?: UserData;
	/**
	 * Represents an array of widgets.
	 */
	widgets?: Widget[];
}
