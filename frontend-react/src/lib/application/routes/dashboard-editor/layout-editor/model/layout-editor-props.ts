import type { SetStateAction } from 'react';

import type {
	LayoutEditorState,
	WidgetInstanceId
} from './layout-editor-model.ts';

/**
 * The props for the layout editor.
 *
 * Defines the interface (and separation of concerns) between the layout editor and its parent.
 */
export interface LayoutEditorProps {
	/**
	 * The current state of the layout editor.
	 *
	 * Contains the selection and the layout.
	 * @see LayoutEditorState
	 * @see import('./layout-editor-model').selectedWidgetId
	 */
	value: LayoutEditorState;
	/**
	 * Callback for when the user changes the layout.
	 *
	 * If not provided, the layout cannot be changed.
	 * @param value - The new state of the layout editor.
	 */
	onChange?: (value: SetStateAction<LayoutEditorState>) => void;
	/**
	 * Callback for when the user adds a widget instance to the layout.
	 * If not provided, no widget instances can be added.
	 * @returns The ID of the new widget instance.
	 * @throws If the widget instance could not be added.
	 */
	onCreateWidgetInstance?: () => WidgetInstanceId;
	/**
	 * Callback for when the user clones a widget instance.
	 *
	 * If not provided, no widget instances can be cloned (i.e., copied and pasted).
	 * @param widgetId - The ID of the widget instance to clone.
	 * @returns The ID of the new widget instance.
	 * @throws If the widget instance could not be cloned.
	 */
	onCloneWidgetInstance?: (widgetId: WidgetInstanceId) => WidgetInstanceId;
	/**
	 * Callback for when the user clicks the undo button.
	 * If not provided, the undo button will not be rendered.
	 */
	onUndo?: () => void;
	/**
	 * Callback for when the user clicks the redo button.
	 * If not provided, the redo button will not be rendered.
	 */
	onRedo?: () => void;
}
