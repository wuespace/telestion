import { KeyboardEvent, useMemo } from 'react';

import { Coordinate } from '..';

export const DELTA_MAP = {
	// Arrow keys
	ArrowUp: { x: 0, y: -1 },
	ArrowDown: { x: 0, y: 1 },
	ArrowLeft: { x: -1, y: 0 },
	ArrowRight: { x: 1, y: 0 },
	// WASD
	KeyW: { x: 0, y: -1 },
	KeyS: { x: 0, y: 1 },
	KeyA: { x: -1, y: 0 },
	KeyD: { x: 1, y: 0 },
	// HJKL (vim)
	KeyH: { x: -1, y: 0 },
	KeyL: { x: 1, y: 0 },
	KeyK: { x: 0, y: -1 },
	KeyJ: { x: 0, y: 1 }
} as const satisfies Record<KeyboardEvent['code'], Coordinate>;

export interface UseLayoutEditorKeyboardShortcutsOptions {
	onMoveSelection?: (delta: Coordinate) => void;
	onMoveSelected?: (delta: Coordinate) => void;
	onResizeSelected?: (delta: Coordinate) => void;
	onUndo?: () => void;
	onRedo?: () => void;
	onDeleteSelected?: () => void;
	onCreateWidgetInstance?: () => void;
	isSelected?: boolean;
}

function getDelta(event: KeyboardEvent) {
	if (Object.prototype.hasOwnProperty.call(DELTA_MAP, event.code))
		return DELTA_MAP[event.code as keyof typeof DELTA_MAP];
}

const arrowKeysJsx = (
	<kbd>
		<kbd>&rarr;</kbd>
		<kbd>&larr;</kbd>
		<kbd>&uarr;</kbd>
		<kbd>&darr;</kbd>
	</kbd>
);

/**
 * Hook that returns keyboard shortcuts for the layout editor.
 *
 * Can be registered on the `onKeyDown` event of a DOM element.
 *
 * Keyboard shortcuts aren't documented to their ever-changing nature. However,
 * they follow the following pattern:
 * - several directional keys are supported (arrow keys, WASD, HJKL)
 * - directional keys move the cursor
 * - if the cursor is on a widget, the widget is selected
 * - if the cursor is on a selected widget, and the alt key is pressed, the
 *   widget, the widget gets moved instead of the cursor
 * - if the cursor is on a selected widget, and the shift and alt keys are
 *   pressed, the widget gets resized instead of the cursor. In other words, the
 *   bottom-right corner of the widget is moved instead of the cursor, while the
 *   top-left corner stays in place.
 * - there are a number of additional shortcuts (creating, deleting, etc.) that
 *   don't require any modifiers. They get executed in the context of the current
 *   cursor position.
 *
 * @param options - callback functions for the shortcuts and `isSelected` flag
 * which determines whether the element is focused (and thus whether to apply
 * the keyboard shortcuts)
 *
 * @returns an object with `onKeyDown` and `hint` properties
 * - `onKeyDown` is a callback function that should be registered on the
 * `onKeyDown` event of a DOM element
 * - `hint` is a JSX element that can be used to display the keyboard shortcuts
 * to the user
 */
export function useLayoutEditorKeyboardShortcuts(
	options: UseLayoutEditorKeyboardShortcutsOptions
) {
	return useMemo(
		() => ({
			onKeyDown: (event: KeyboardEvent) => {
				const delta = getDelta(event);

				if (delta) {
					event.preventDefault();
					if (event.shiftKey && event.altKey && options.isSelected) {
						return options.onResizeSelected?.(delta);
					} else if (event.altKey && options.isSelected) {
						return options.onMoveSelected?.(delta);
					} else {
						return options.onMoveSelection?.(delta);
					}
				}

				switch (event.code) {
					case 'Delete':
					case 'Backspace':
						event.preventDefault();
						options.onDeleteSelected?.();
						return;
					case 'Enter':
					case 'Space':
						event.preventDefault();
						options.onCreateWidgetInstance?.();
						return;
				}
			},
			hint: options.isSelected ? (
				<>
					Move cursor: {arrowKeysJsx}; Resize: <kbd>⇧ Shift</kbd>+
					<kbd>Alt / ⌥&nbsp;Option</kbd>+{arrowKeysJsx}; Move:{' '}
					<kbd>Alt / ⌥&nbsp;Option</kbd>+{arrowKeysJsx}; Delete:{' '}
					<kbd>Delete / ⌫</kbd>
				</>
			) : (
				<>
					Move cursor: {arrowKeysJsx}; Create: <kbd>Enter</kbd>
				</>
			)
		}),
		[options]
	);
}
