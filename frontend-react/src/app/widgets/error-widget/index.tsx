import { ErrorWidget } from './error-widget.tsx';
import { Widget } from '../../../lib';
import { WidgetConfigWrapper } from '@wuespace/telestion/widget';

export const errorWidget: Widget = {
	id: 'error-widget',
	label: 'Error Widget',

	createConfig() {
		return {};
	},

	element: <ErrorWidget />,
	configElement: (
		<WidgetConfigWrapper>
			The error widget doesn't need any config controls.
		</WidgetConfigWrapper>
	)
};
