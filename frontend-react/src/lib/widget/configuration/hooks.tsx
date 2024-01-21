import { BaseWidgetConfiguration } from './model.tsx';
import { useConfigureWidget } from './configuration-context.tsx';
import { SetStateAction, useMemo } from 'react';

/**
 * A hook to get and set a specific field of the current widget configuration.
 *
 * Only works inside a widget configuration context. Values returned and passed
 * into the setter are always validated and transformed by the widget's
 * {@link Widget.createConfig} function.
 *
 * To validate the type of the individual field, the `validator` function is used.
 *
 * @param name - the name of the field to get and set
 * @param validator - a function to validate the type of the field
 *
 * @see useConfigureWidget
 *
 * @returns the current value of the field and a function to update it
 * @throws Error - if the field does not exist in the widget configuration
 * @throws Error - if the type of the field does not match the validator
 *
 * @example Basic usage
 * ```ts
 * // Config: { text: string }
 * const [text, setText] = useConfigureWidgetField('text', s => z.string().parse(s));
 *
 * return <input value={text} onChange={e => setText(e.target.value)} />;
 * ```
 */
export function useConfigureWidgetField<
	T extends BaseWidgetConfiguration[string]
>(name: string, validator: (v: unknown) => T) {
	const [widgetConfiguration, setValue] = useConfigureWidget();
	return useMemo(() => {
		const onSetValue = (newValue: SetStateAction<T>) =>
			setValue(oldWidgetConfiguration => {
				try {
					if (typeof newValue === 'function')
						newValue = newValue(validator(oldWidgetConfiguration[name]));
					newValue = validator(newValue);
					return { ...oldWidgetConfiguration, [name]: newValue };
				} catch (e) {
					if (e instanceof Error)
						throw new Error(
							`Type error while trying to set widget configuration field "${name}". Details: ${e.message}`
						);
					else throw e;
				}
			});

		try {
			const validatedField = validator(widgetConfiguration[name]);
			return [validatedField, onSetValue] as const;
		} catch (e) {
			if (e instanceof Error)
				throw new Error(
					`Widget configuration does not contain a property named "${name}". Please adjust your createConfig function. Details: ${e.message}`
				);
			else throw e;
		}
	}, [name, validator, widgetConfiguration, setValue]);
}
