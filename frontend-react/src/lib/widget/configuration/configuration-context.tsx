import { createContext, ReactNode, SetStateAction, useContext } from 'react';
import {
	BaseWidgetConfiguration,
	WidgetConfigurationContextValue
} from '@wuespace/telestion/widget/configuration/model.tsx';
import { Widget } from '@wuespace/telestion';

/**
 * The context for widget configuration controls.
 *
 * Contains a getter and setter for the current widget configuration.
 * This is similar to `useState` but for widget configurations.
 *
 * @internal
 */
const WidgetConfigurationContext =
	createContext<WidgetConfigurationContextValue>({
		get configuration(): never {
			throw new Error(
				'Widget configuration controls can only be accessed inside a widget configuration context.'
			);
		},
		setConfiguration: (): never => {
			throw new Error(
				'Widget configuration controls can only be set inside a widget configuration context.'
			);
		}
	});

/**
 * Similar to `useState` but for widget configurations.
 *
 * Only works inside a widget configuration context. Values returned and passed
 * into the setter are always validated and transformed by the widget's
 * {@link Widget.createConfig} function.
 *
 * @returns the current widget configuration and a function to update it
 */
export function useConfigureWidget() {
	const { configuration, setConfiguration } = useContext(
		WidgetConfigurationContext
	);

	return [configuration, setConfiguration] as const;
}

/**
 * Provides a {@link WidgetConfigurationContext} for the given children.
 * @internal
 * @param props - the props for the widget configuration context provider
 */
export function WidgetConfigurationContextProvider(props: {
	/**
	 * the current value of the configuration
	 */
	value: BaseWidgetConfiguration;
	/**
	 * a function to update the configuration on the parent component
	 */
	onChange: (s: BaseWidgetConfiguration) => void;
	/**
	 * a function to create a valid configuration from a raw configuration
	 * @see Widget.createConfig
	 */
	createConfig: Widget['createConfig'];
	/**
	 * the children of this context provider
	 *
	 * This should be the widget configuration controls.
	 */
	children: ReactNode;
}) {
	const onSetConfiguration = (
		newConfig: SetStateAction<BaseWidgetConfiguration>
	) => {
		newConfig =
			typeof newConfig === 'function' ? newConfig(props.value) : newConfig;
		newConfig = props.createConfig(newConfig);
		props.onChange(newConfig);
	};

	return (
		<WidgetConfigurationContext.Provider
			value={{
				configuration: props.createConfig(props.value),
				setConfiguration: onSetConfiguration
			}}
		>
			{props.children}
		</WidgetConfigurationContext.Provider>
	);
}
