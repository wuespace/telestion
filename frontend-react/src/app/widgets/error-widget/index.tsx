import { ErrorWidget } from './error-widget.tsx';
import { Widget } from '../../../lib';

export const errorWidget: Widget = {
	id: 'error-widget',
	label: 'Error Widget',

	createConfig() {
		return {};
	},

	element: <ErrorWidget />,
	configElement: <div>Config</div>
};
