import { useContext } from 'react';
import { widgetConfigContext } from '../../widget';

/**
 * Retrieves the widget configuration from the widgetConfigContext.
 *
 * @typeParam T - The type of the widget configuration.
 * @returns The widget configuration retrieved from the widgetConfigContext.
 * @throws Error Throws an error if useWidgetConfig is not used within a WidgetConfigProvider.
 */
// The type is safe due to the surrounding application structure.
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function useWidgetConfig<T>(): T {
	const widgetConfig = useContext(widgetConfigContext);
	if (!widgetConfig) {
		throw new Error(
			'useWidgetConfig must be used within a WidgetConfigProvider'
		);
	}
	return widgetConfig as T;
}
