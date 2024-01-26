import { z } from 'zod';
import { SetStateAction } from 'react';
import { widgetInstanceSchema } from '@wuespace/telestion/user-data';

/**
 * The base type for all widget configurations.
 *
 * A JSON object that contains JSON-serializable values under string keys.
 */
export type BaseWidgetConfiguration = z.infer<
	typeof widgetInstanceSchema.shape.configuration
>;

/**
 * The context value for widget configuration controls.
 * @internal
 */
export interface WidgetConfigurationContextValue<
	T extends BaseWidgetConfiguration = BaseWidgetConfiguration
> {
	configuration: T;
	setConfiguration: (s: SetStateAction<T>) => void;
}
