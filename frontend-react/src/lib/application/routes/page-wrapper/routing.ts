import { getUserData } from '../../../user-data';

export function pageWrapperLoader() {
	return () => {
		const userData = getUserData();

		return {
			dashboards: userData?.dashboards
		};
	};
}
