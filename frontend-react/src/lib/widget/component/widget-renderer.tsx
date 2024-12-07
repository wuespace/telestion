import { createContext } from 'react';
import { getWidgetById } from '../state.ts';
import { getUserData } from '../../user-data';

import styles from './widget-renderer.module.css';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from './error-fallback.tsx';

export interface WidgetRendererProps {
	widgetInstanceId: string;
}

export const WidgetConfigContext = createContext<unknown>(undefined);

/**
 * Renders a widget based on the provided widgetInstanceId.
 *
 * @param WidgetRendererProps - The props for the WidgetRenderer.
 *
 * @returns The rendered widget.
 *
 * @throws Error If the widget instance is not found.
 */
export function WidgetRenderer({ widgetInstanceId }: WidgetRendererProps) {
	const widgetInstance = getUserData()?.widgetInstances[widgetInstanceId];
	if (!widgetInstance) {
		throw new Error('Widget instance not found. Error Code: f0f0a81e');
	}

	const widget = getWidgetById(widgetInstance.type);

	const registerCode = `
registerWidget({
	id: '${widgetInstance.type}'
	...
});
	`;

	return (
		<div
			className={styles.widgetRenderer}
			style={{ '--id': CSS.escape(widgetInstanceId) }}
		>
			{widget ? (
				<WidgetConfigContext
					key={`renderer-${widgetInstanceId}`}
					value={widgetInstance.configuration}
				>
					<ErrorBoundary FallbackComponent={ErrorFallback}>
						{widget.element}
					</ErrorBoundary>
				</WidgetConfigContext>
			) : (
				<div>
					<p>Widget isn't registered.</p>
					<p>
						To register the widget, please call:
						<pre>
							<code>{registerCode}</code>
						</pre>
					</p>
				</div>
			)}
		</div>
	);
}
