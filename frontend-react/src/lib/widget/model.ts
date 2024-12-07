import { ReactNode } from 'react';

import { BaseWidgetConfiguration } from '@wuespace/telestion/widget/configuration/model.tsx';

/**
 * A widget that can be used in widget instances on dashboards.
 *
 * @typeParam T - the type of the widget configuration
 * @see {@link userData.WidgetInstance}
 */
export interface Widget<
	T extends BaseWidgetConfiguration = BaseWidgetConfiguration
> {
	/**
	 * Represents an identifier of the widget type.
	 */
	id: string;

	/**
	 * Represents a human-readable label of the widget type.
	 */
	label: string;

	/**
	 * A function that takes an object that contains the previous widget configuration (which may or may not be from a
	 * previous version of the client (or could also, when creating new widget instances, be empty) and returns a valid
	 * configuration for the widget.
	 *
	 * For widgets with expected breaking changes, it is therefore useful to have some version identifier be a part
	 * of the configuration options to enable more complex migration logic in this function.
	 * @param input - previous configuration or empty
	 */
	createConfig(input: Partial<T> & BaseWidgetConfiguration): T;

	/**
	 * A function that takes the configuration of the widget and returns a React element that represents the widget.
	 */
	element: ReactNode;
	/**
	 * A configuration element that is used to configure the widget.
	 */
	configElement: ReactNode;
	/**
	 * If `true`, the widget gets rendered without a default padding.
	 */
	borderless?: boolean;
}
