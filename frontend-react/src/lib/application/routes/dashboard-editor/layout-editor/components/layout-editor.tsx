import { useCallback, useMemo, useRef } from 'react';
import { z } from 'zod';
import { clsx } from 'clsx';
import { DndContext, DragEndEvent } from '@dnd-kit/core';

import {
	anyInBounds,
	Bounds,
	Coordinate,
	deleteSelected,
	fillWith,
	getBounds,
	getWidgetIds,
	LayoutEditorProps,
	LayoutEditorState,
	moveSelected,
	moveSelection,
	resizeGrid,
	resizeSelected,
	select,
	selectedWidgetId
} from '..';
import { gap } from '../constants.tsx';
import { EmptyCell } from './empty-cell.tsx';
import { LayoutEditorWidgetInstance } from './layout-editor-widget-instance.tsx';
import { ActionButtons } from './action-buttons.tsx';
import { useLayoutEditorKeyboardShortcuts } from '../hooks/use-layout-editor-keyboard-shortcuts.tsx';

import styles from './layout-editor.module.css';

export function LayoutEditor(props: LayoutEditorProps) {
	const widgetInstances = useMemo(() => {
		return getWidgetIds(props.value).map(id => {
			const bounds = getBounds(props.value, id);
			return {
				id,
				bounds
			};
		});
	}, [props.value]);

	const height = props.value.layout.length;
	const width = props.value.layout[0].length;

	const layoutEditorRef = useRef<HTMLDivElement | null>(null);
	const applyLayoutChange = useCallback(
		(stateFn: (state: LayoutEditorState) => LayoutEditorState) => {
			if (!props.onChange) {
				console.warn(
					'Cannot apply layout change when onChange is not provided'
				);
				return;
			}
			layoutEditorRef.current?.focus();
			props.onChange(s => stateFn(s));
		},
		[props]
	);

	/**
	 * A reference to a single background cell for size calculations.
	 *
	 * Corresponds to a grid cell with a size of 1x1.
	 */
	const singleCellRef = useRef<HTMLDivElement | null>(null);

	const onMoveEnd = useCallback(
		(event: DragEndEvent) => {
			if (!singleCellRef.current)
				throw new Error('singleCellRef.current is null');
			const cellRect = singleCellRef.current.getBoundingClientRect();
			const deltaX = Math.round(event.delta.x / (cellRect.width + gap));
			const deltaY = Math.round(event.delta.y / (cellRect.height + gap));

			const oldCoords = z
				.object({
					x: z.number(),
					y: z.number()
				})
				.parse(event.active.data.current?.bounds);

			applyLayoutChange(state =>
				moveSelected(select(state, oldCoords), {
					x: deltaX,
					y: deltaY
				})
			);
		},
		[applyLayoutChange]
	);

	const onLayoutEditorWidgetInstanceSelect = useCallback(
		(bounds: Bounds) => {
			applyLayoutChange(state => select(state, bounds));
		},
		[applyLayoutChange]
	);

	const onLayoutEditorWidgetInstanceResize = useCallback(
		(bounds: Bounds, resizeDelta: Coordinate) => {
			applyLayoutChange(state =>
				resizeSelected(select(state, bounds), resizeDelta)
			);
		},
		[applyLayoutChange]
	);

	const onEmptyCellCreate = useCallback(
		(bounds: Bounds) => {
			applyLayoutChange(state => {
				if (anyInBounds(state, bounds, s => s !== '.')) {
					console.warn(
						'Cannot create new widget instance while another is selected'
					);
					return state;
				}

				if (!props.onCreateWidgetInstance) {
					console.warn(
						'Cannot create new widget instance when onCreateWidgetInstance is not provided'
					);
					return state;
				}

				const widgetId = props.onCreateWidgetInstance();
				return select(fillWith(state, widgetId, bounds), bounds);
			});
		},
		[applyLayoutChange, props]
	);

	const { onKeyDown, hint } = useLayoutEditorKeyboardShortcuts({
		onCreateWidgetInstance: () =>
			onEmptyCellCreate({
				...props.value.selection,
				width: 1,
				height: 1
			}),
		onDeleteSelected: () => applyLayoutChange(state => deleteSelected(state)),
		onMoveSelected: delta =>
			applyLayoutChange(state => moveSelected(state, delta)),
		onMoveSelection: delta =>
			applyLayoutChange(state => moveSelection(state, delta)),
		onResizeSelected: delta =>
			applyLayoutChange(state => resizeSelected(state, delta)),
		isSelected: selectedWidgetId(props.value) !== undefined
	});
	const onGridResize = useCallback(
		(width: number, height: number) => {
			applyLayoutChange(s => resizeGrid(s, width, height));
		},
		[applyLayoutChange]
	);

	return (
		<div className={styles.layoutEditor}>
			<DndContext onDragEnd={onMoveEnd}>
				<ActionButtons
					{...props}
					onDelete={() => applyLayoutChange(state => deleteSelected(state))}
					onResizeGrid={onGridResize}
				/>

				{/* eslint-disable jsx-a11y/no-noninteractive-tabindex */}
				{/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
				<div
					className={clsx(styles.grid)}
					style={{
						'--width': width.toString(),
						'--height': height.toString(),
						'--gap': gap.toString()
					}}
					tabIndex={0}
					onKeyDown={onKeyDown}
					ref={layoutEditorRef}
				>
					{/*Background cells:*/}
					{props.value.layout.map((row, y) =>
						row.map((_, x) => (
							<EmptyCell
								key={`${x.toString()},${y.toString()}`}
								y={y}
								x={x}
								ref={x + y === 0 ? singleCellRef : undefined}
								onCreate={onEmptyCellCreate}
							/>
						))
					)}
					{/*Widget Instances*/}
					{widgetInstances.map(({ id, bounds }) => (
						<LayoutEditorWidgetInstance
							key={id}
							bounds={bounds}
							id={id}
							selected={selectedWidgetId(props.value) === id}
							onSelect={onLayoutEditorWidgetInstanceSelect}
							onResize={onLayoutEditorWidgetInstanceResize}
						/>
					))}
					{/*	Cursor*/}
					<div
						className={clsx(styles.cursor)}
						style={{
							'--x': props.value.selection.x,
							'--y': props.value.selection.y
						}}
					/>
				</div>
				<p className={styles.layoutEditorKeyboardHints}>
					<small>{hint}</small>
				</p>
			</DndContext>
		</div>
	);
}
