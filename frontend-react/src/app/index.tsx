import { initTelestion, registerWidgets, UserData } from '../lib';
import { simpleWidget } from './widgets/simple-widget';

const defaultUserData: UserData = {
	version: '0.0.1',
	dashboards: {
		sdjo8242: {
			title: 'Default Dashboard',
			layout: [
				['.', '8fj2o4', '.'],
				['.', '.', '.']
			]
		}
	},
	widgetInstances: {
		'8fj2o4': {
			type: 'simple-widget',
			configuration: {
				text: 'Hello World!'
			}
		}
	}
};

registerWidgets(simpleWidget);

await initTelestion({
	currentVersion: '0.0.1',
	defaultBackendUrl: 'ws://localhost:9222',
	defaultUserData
});
