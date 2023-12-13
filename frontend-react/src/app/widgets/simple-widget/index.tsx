import { z } from 'zod';
import { SimpleWidget } from './simple-widget.tsx';
import { Widget } from '../../../lib';

export type WidgetConfig = {
	text: string;
};

export const simpleWidget: Widget<WidgetConfig> = {
	id: 'simple-widget',
	label: 'Simple Widget',

	createConfig(
		input: Partial<WidgetConfig> & Record<string, unknown>
	): WidgetConfig {
		return { text: z.string().catch('Initial Text').parse(input.text) };
	},

	element: <SimpleWidget />,
	configElement: <div>Config</div>
};
