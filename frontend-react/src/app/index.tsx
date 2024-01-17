import { initTelestion, registerWidgets, UserData } from '@wuespace/telestion';
import { simpleWidget } from './widgets/simple-widget';
import { errorWidget } from './widgets/error-widget';

const defaultUserData: UserData = {
	version: '0.0.1',
	dashboards: {
		sdjo8242: {
			title: 'Default Dashboard',
			layout: [
				['.', '8fj2o4', '.'],
				['.', '9fj2o4', '9fj2o4']
			]
		}
	},
	widgetInstances: {
		'8fj2o4': {
			type: 'simple-widget',
			configuration: {
				text: 'Hello World!'
			}
		},
		'9fj2o4': {
			type: 'error-widget',
			configuration: {}
		}
	}
};

registerWidgets(simpleWidget, errorWidget);

await initTelestion({
	version: '0.0.1',
	defaultBackendUrl: 'ws://localhost:9222',
	defaultUserData
});
