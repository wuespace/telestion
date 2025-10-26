import { z } from 'zod';
import { SimpleWidget } from './simple-widget.tsx';
import { Widget } from '../../../lib';
import {
	WidgetConfigCheckboxField,
	WidgetConfigTextField,
	WidgetConfigWrapper
} from '@wuespace/telestion/widget';

export type WidgetConfig = {
	text: string;
	bool: boolean;
};

export const simpleWidget: Widget<WidgetConfig> = {
	id: 'simple-widget',
	label: 'Simple Widget',

	createConfig(
		input: Partial<WidgetConfig> & Record<string, unknown>
	): WidgetConfig {
		return z
			.object({
				text: z.string().catch('Initial Text'),
				bool: z.boolean().catch(false)
			})
			.default({
				text: 'Initial text',
				bool: false
			})
			.parse(input);
	},

	element: <SimpleWidget />,
	configElement: (
		<WidgetConfigWrapper>
			<WidgetConfigCheckboxField label={'Bool value'} name={'bool'} />
			<WidgetConfigTextField label={'Test Text'} name={'text'} />
		</WidgetConfigWrapper>
	)
};
