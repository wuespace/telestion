export interface Coordinate {
	x: number;
	y: number;
}

export interface Bounds extends Coordinate {
	width: Bounds['x'];
	height: Bounds['y'];
}

export type WidgetInstanceId = string;

export interface LayoutEditorState {
	layout: WidgetInstanceId[][];
	selection: Coordinate;
}

/**
 * Returns the widget instance id at the selection.
 * Returns undefined if the selection is empty.
 *
 * @throws InvalidSelectionError if the selection is invalid (out of bounds)
 *
 * @param state - the layout editor state
 * @returns the widget instance id at the selection or undefined if the selection is empty
 */
export function selectedWidgetId(
	state: LayoutEditorState
): WidgetInstanceId | undefined {
	const { selection, layout } = state;
	const { x, y } = selection;

	if (x < 0 || y < 0) {
		throw new InvalidSelectionError('Invalid selection');
	}

	if (y >= layout.length) {
		throw new InvalidSelectionError('Invalid selection');
	}
	const row = layout[y];

	if (x >= row.length) {
		throw new InvalidSelectionError('Invalid selection');
	}
	const widgetId = row[x];

	if (widgetId === '.') {
		return undefined;
	}
	return widgetId;
}

/**
 * Returns true if the given values are in ascending order.
 * @param values - the values to check
 * @returns true if the given values are in ascending order, i.e., `values[n] <= values[n+1]` for all `n`
 */
function isAscending(...values: number[]) {
	for (let i = 1; i < values.length; i++) {
		if (values[i] < values[i - 1]) {
			return false;
		}
	}
	return true;
}

/**
 * Fills the given area with the given widget instance id.
 *
 * Ignores any cells described by the bounds that are not in the layout.
 * @param state - the layout editor state
 * @param widgetId - the widget instance id to fill with
 * @param bounds - the bounds of the area to fill
 * @returns the new layout editor state
 */
export function fillWith(
	state: LayoutEditorState,
	widgetId: WidgetInstanceId,
	bounds: Bounds
): LayoutEditorState {
	const { x, y, width, height } = bounds;
	const { layout } = state;

	return {
		...state,
		layout: layout.map((row, rowIndex) =>
			isAscending(y, rowIndex, y + height - 1) // in fill area
				? row.map((cell, columnIndex) =>
						isAscending(x, columnIndex, x + width - 1) // in fill area
							? widgetId
							: cell
					)
				: row
		)
	};
}

/**
 * Selects the given coordinate.
 * @param state - the layout editor state
 * @param selection - the coordinate to select
 * @returns the new layout editor state (with the given selection)
 */
export function select(
	state: LayoutEditorState,
	selection: Coordinate
): LayoutEditorState {
	return {
		...state,
		selection
	};
}

/**
 * Moves the selection by the given delta.
 *
 * The selection is clamped to the layout.
 * @param state - the layout editor state
 * @param delta - the delta to move the selection by
 * @returns the new layout editor state (with the selection moved by the given delta)
 */
export function moveSelection(
	state: LayoutEditorState,
	delta: Coordinate
): LayoutEditorState {
	const { selection } = state;
	const { x, y } = selection;

	return select(state, {
		x: Math.max(0, Math.min(state.layout[0].length - 1, x + delta.x)),
		y: Math.max(0, Math.min(state.layout.length - 1, y + delta.y))
	});
}

/**
 * Returns the bounds of the given widget instance.
 * @param state - the layout editor state
 * @param widgetId - the widget instance id
 * @throws WidgetInstanceNotFoundError if the widget instance is not in the layout
 * @returns the bounds of the given widget instance
 */
export function getBounds(
	state: LayoutEditorState,
	widgetId: WidgetInstanceId
): Bounds {
	const { layout } = state;

	let minX = Infinity;
	let minY = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;

	for (let y = 0; y < layout.length; y++) {
		const row = layout[y];

		for (let x = 0; x < row.length; x++) {
			if (row[x] === widgetId) {
				minX = Math.min(minX, x);
				minY = Math.min(minY, y);
				maxX = Math.max(maxX, x);
				maxY = Math.max(maxY, y);
			}
		}
	}

	if (!Number.isFinite(minX)) {
		throw new WidgetInstanceNotFoundError(
			`widget instance ${widgetId} not found in layout`
		);
	}

	return {
		x: minX,
		y: minY,
		width: maxX - minX + 1,
		height: maxY - minY + 1
	};
}

/**
 * Gets the widget instance ids of all widget instances in the layout.
 * @param state - the layout editor state
 * @returns an array of all widget instance ids in the layout (without duplicates)
 */
export function getWidgetIds(state: LayoutEditorState): WidgetInstanceId[] {
	const { layout } = state;
	const widgetIds = new Set<WidgetInstanceId>();

	for (const row of layout) {
		for (const cell of row) {
			if (cell !== '.') {
				widgetIds.add(cell);
			}
		}
	}

	return Array.from(widgetIds);
}

/**
 * Transforms the given bounds by the given delta.
 *
 * The delta is applied to the top left corner of the bounds.
 *
 * The width and height of the bounds are always at least 1.
 * @param bounds - the old bounds
 * @param delta - the delta to apply
 * @returns the new bounds
 */
export function transformBounds(bounds: Bounds, delta: Bounds): Bounds {
	return {
		x: Math.max(0, bounds.x + delta.x),
		y: Math.max(0, bounds.y + delta.y),
		width: Math.max(1, bounds.width + delta.width),
		height: Math.max(1, bounds.height + delta.height)
	};
}

/**
 * Moves the selected widget instance by the given delta.
 *
 * The widget instance is clamped to the layout.
 *
 * The delta is applied to the top left corner of the widget instance.
 * @param state - the layout editor state
 * @param delta - the delta to move the widget instance by
 * @returns the new layout editor state (with the selected widget instance moved by the given delta)
 * If the widget instance cannot be moved, the old state is returned.
 */
export function moveSelected(
	state: LayoutEditorState,
	delta: Coordinate
): LayoutEditorState {
	const widgetId = selectedWidgetId(state);

	if (!widgetId) {
		return state;
	}

	const { layout } = state;

	const bounds = getBounds(state, widgetId);
	const newBounds = transformBounds(bounds, { ...delta, width: 0, height: 0 });

	// check if newBounds is within the layout
	const newMaxX = newBounds.x + newBounds.width;
	const newMaxY = newBounds.y + newBounds.height;
	const layoutWidth = layout[0].length;
	const layoutHeight = layout.length;
	if (
		newMaxX > layoutWidth ||
		newMaxY > layoutHeight ||
		newBounds.x < 0 ||
		newBounds.y < 0
	) {
		console.warn('Cannot move widget instance outside of the layout');
		return state;
	}

	// check if newBounds is not overlapping with other widgets
	for (let y = newBounds.y; y < newMaxY; y++) {
		const row = layout[y];

		for (let x = newBounds.x; x < newMaxX; x++) {
			if (row[x] !== '.' && row[x] !== widgetId) {
				console.warn(
					'Cannot move widget instance on top of another widget instance'
				);
				return state;
			}
		}
	}

	// no collision, move the widget
	state = fillWith(state, '.', bounds);
	state = fillWith(state, widgetId, newBounds);
	state = select(state, { x: newBounds.x, y: newBounds.y });
	return state;
}

/**
 * Resizes the selected widget instance by the given delta.
 * @param state - the layout editor state
 * @param delta - the delta to resize the widget instance by
 * @returns the new layout editor state (with the selected widget instance resized by the given delta)
 * If the widget instance cannot be resized, the old state is returned.
 */
export function resizeSelected(
	state: LayoutEditorState,
	delta: Coordinate
): LayoutEditorState {
	const widgetId = selectedWidgetId(state);

	if (!widgetId) {
		return state;
	}

	const oldBounds = getBounds(state, widgetId);
	const newBounds = transformBounds(oldBounds, {
		x: 0,
		y: 0,
		width: delta.x,
		height: delta.y
	});

	if (
		anyInBounds(
			state,
			newBounds,
			widgetId => widgetId !== '.' && widgetId !== selectedWidgetId(state)
		)
	) {
		console.warn(
			'Cannot resize widget instance on top of another widget instance'
		);
		return state;
	}

	state = fillWith(state, '.', oldBounds);
	state = fillWith(state, widgetId, newBounds);
	state = select(state, { x: newBounds.x, y: newBounds.y });
	return state;
}

/**
 * Deletes the selected widget instance from the layout, replacing it with empty cells.
 * @param state - the layout editor state
 * @returns the new layout editor state (with the selected widget instance deleted)
 */
export function deleteSelected(state: LayoutEditorState): LayoutEditorState {
	const widgetId = selectedWidgetId(state);

	if (!widgetId) {
		return state;
	}

	const bounds = getBounds(state, widgetId);

	return fillWith(state, '.', bounds);
}

/**
 * Resizes the grid to the given size.
 * If the grid is enlarged, the new cells are filled with empty cells.
 * If the grid is shrunk, the cells outside the new grid are deleted.
 * @param state - the layout editor state
 * @param columns - the new number of columns
 * @param rows - the new number of rows
 * @throws InvalidBoundsError if the given size is invalid (less than 1)
 * @returns the new layout editor state (with the grid resized to the given size)
 */
export function resizeGrid(
	state: LayoutEditorState,
	columns: number,
	rows: number
) {
	const { layout } = state;

	if (columns < 1 || rows < 1) {
		throw new InvalidBoundsError(
			`Invalid grid size while resizing the grid. Must be at least 1x1, got ${columns.toString()}x${rows.toString()}`
		);
	}

	const newLayout: WidgetInstanceId[][] = [];

	for (let y = 0; y < rows; y++) {
		const row: WidgetInstanceId[] = [];

		for (let x = 0; x < columns; x++) {
			if (y < layout.length && x < layout[y].length) {
				row.push(layout[y][x]);
			} else {
				row.push('.');
			}
		}

		newLayout.push(row);
	}

	const newSelection = {
		x: Math.min(state.selection.x, columns - 1),
		y: Math.min(state.selection.y, rows - 1)
	};

	return {
		...state,
		selection: newSelection,
		layout: newLayout
	};
}

/**
 * Returns true if any cell in the given bounds matches the given predicate.
 * @param state - the layout editor state
 * @param bounds - the bounds to check
 * @param predicate - the predicate to check against.
 * The predicate is called with the widget instance id, x and y coordinates of each cell.
 * @returns true if any cell in the given bounds matches the given predicate
 */
export function anyInBounds(
	state: LayoutEditorState,
	bounds: Bounds,
	predicate: (widgetId: WidgetInstanceId, x: number, y: number) => boolean
): boolean {
	const { layout } = state;
	const { x, y, width, height } = bounds;

	for (let row = y; row < y + height && row < layout.length; row++) {
		for (
			let column = x;
			column < x + width && column < layout[0].length;
			column++
		) {
			if (predicate(layout[row][column], column, row)) {
				return true;
			}
		}
	}

	return false;
}

/**
 * Returns true if all cells in the given bounds match the given predicate.
 * @param state - the layout editor state
 * @param bounds - the bounds to check
 * @param predicate - the predicate to check against.
 * The predicate is called with the widget instance id, x and y
 * coordinates of each cell.
 * @returns true if all cells in the given bounds match the given predicate
 */
export function everyInBounds(
	state: LayoutEditorState,
	bounds: Bounds,
	predicate: (widgetId: WidgetInstanceId, x: number, y: number) => boolean
): boolean {
	const { layout } = state;
	const { x, y, width, height } = bounds;

	for (let row = y; row < y + height; row++) {
		for (let column = x; column < x + width; column++) {
			if (!predicate(layout[row][column], column, row)) {
				return false;
			}
		}
	}

	return true;
}

/**
 * An error that is thrown when the selection is invalid.
 *
 * The selection is invalid if it is out of bounds.
 */
export class InvalidSelectionError extends Error {}

/**
 * An error that is thrown when the bounds are invalid.
 *
 * The bounds are invalid if they are less than 1x1.
 */
export class InvalidBoundsError extends Error {}

/**
 * An error that is thrown when a widget instance is not found in the layout.
 */
export class WidgetInstanceNotFoundError extends Error {}
