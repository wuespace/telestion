import { Widget } from './model.ts';

/**
 * A mapping of widget ids to widget objects.
 *
 * @internal
 */
const widgetMap = new Map<string, Widget>();

/**
 * Returns an array of all the widgets that are currently registered.
 *
 * @returns An array containing all the widgets.
 */
export function getWidgets() {
	return Array.from(widgetMap.values());
}

/**
 * Retrieves a widget by its unique type ID.
 *
 * @param id - The unique type ID of the widget.
 * @returns The widget associated with the ID, or null if the widget is not found.
 */
export function getWidgetById(id: string) {
	return widgetMap.get(id);
}

/**
 * Registers widgets in the widget store.
 *
 * If a widget with the same ID already exists in the widget store, a warning is logged and the widget is ignored.
 *
 * @param widgets - The widgets to be registered.
 */
export function registerWidgets(...widgets: Widget[]) {
	for (const widget of widgets) {
		if (widgetMap.has(widget.id)) {
			console.warn(
				`Widget with id ${widget.id} already exists in widget store. Ignoring`
			);
			continue;
		}
		widgetMap.set(widget.id, widget);
	}
}
