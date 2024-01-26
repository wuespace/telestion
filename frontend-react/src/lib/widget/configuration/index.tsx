import { z } from 'zod';
import { FormCheck, FormControl, FormGroup, FormLabel } from 'react-bootstrap';
import { useConfigureWidgetField } from './hooks.tsx';
import { ReactNode } from 'react';

export type { BaseWidgetConfiguration } from './model.tsx';
export * from './hooks.tsx';
export { useConfigureWidget } from './configuration-context.tsx';

// Helper components

/**
 * Wraps the widget configuration controls and gives them the correct margins.
 *
 * Should be used inside the widget configuration element.
 *
 * @see Widget.configElement
 */
export function WidgetConfigWrapper({ children }: { children: ReactNode }) {
	return <section className={'px-3'}>{children}</section>;
}

/**
 * A checkbox field for the widget configuration.
 * @param props - the props for the checkbox field
 *
 * @example
 * ```tsx
 * // Config: { enabled: boolean }
 * configElement: <WidgetConfigWrapper>
 *   <WidgetConfigCheckboxField label={'Enabled'} name={'enabled'} />
 * </WidgetConfigWrapper>
 * ```
 *
 * @see Widget.configElement
 */
export function WidgetConfigCheckboxField(props: {
	label: string;
	name: string;
}) {
	const [checked, setChecked] = useConfigureWidgetField(props.name, b =>
		z.boolean().parse(b)
	);

	return (
		<FormGroup className={'mb-3'}>
			<FormCheck
				data-name={props.name}
				label={props.label}
				checked={checked}
				onChange={e => setChecked(e.target.checked)}
			/>
		</FormGroup>
	);
}

/**
 * A text field for the widget configuration.
 * @param props - the props for the text field
 *
 * @example
 * ```tsx
 * // Config: { text: string }
 * configElement: <WidgetConfigWrapper>
 *   <WidgetConfigTextField label={'Text'} name={'text'} />
 * </WidgetConfigWrapper>
 * ```
 *
 * @see Widget.configElement
 */
export function WidgetConfigTextField(props: { label: string; name: string }) {
	const [value, setValue] = useConfigureWidgetField(props.name, s =>
		z.string().parse(s)
	);

	return (
		<FormGroup className={'mb-3'}>
			<FormLabel>{props.label}</FormLabel>
			<FormControl
				data-name={props.name}
				value={value}
				onChange={e => setValue(e.target.value)}
			/>
		</FormGroup>
	);
}
