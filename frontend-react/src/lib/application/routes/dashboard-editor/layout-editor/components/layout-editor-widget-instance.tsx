import { useCallback, useState } from 'react';
import { DndContext, DragEndEvent, useDraggable } from '@dnd-kit/core';
import { CSS as CSSUtil } from '@dnd-kit/utilities';
import { clsx } from 'clsx';

import { Bounds, Coordinate } from '../model/layout-editor-model.ts';
import { ResizeHandle } from './resize-handle.tsx';

import styles from './layout-editor.module.css';

export function LayoutEditorWidgetInstance(props: {
	bounds: Bounds;
	id: string;
	selected?: boolean;
	onSelect?(bounds: Bounds): void;
	onResize?(bounds: Bounds, resizeDelta: Coordinate): void;
}) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		node: widgetInstanceNode
	} = useDraggable({
		id: props.id,
		data: {
			widgetId: props.id,
			bounds: props.bounds
		}
	});
	const [resizeDelta, setResizeDelta] = useState<Coordinate>({
		x: 0,
		y: 0
	});
	const onResizeEnd = useCallback(
		(event: DragEndEvent) => {
			const resizeDelta = event.delta; // delta in px
			const oldBounds = props.bounds; // previous bounds to select

			if (!widgetInstanceNode.current)
				throw new Error('widgetInstanceNode.current is null');

			const originalNodeWidth =
				widgetInstanceNode.current.offsetWidth - resizeDelta.x;
			const originalNodeHeight =
				widgetInstanceNode.current.offsetHeight - resizeDelta.y;

			const singleCellWidth = originalNodeWidth / oldBounds.width;
			const singleCellHeight = originalNodeHeight / oldBounds.height;

			const onResizeDelta = {
				x: Math.round(resizeDelta.x / singleCellWidth),
				y: Math.round(resizeDelta.y / singleCellHeight)
			};

			props.onResize?.(oldBounds, onResizeDelta);
			setResizeDelta({ x: 0, y: 0 });
		},
		[props, widgetInstanceNode]
	);

	return (
		<div
			className={clsx(
				styles.widgetInstance,
				props.selected && styles.isSelected,
				(transform?.x ?? 0) + (transform?.y ?? 0) !== 0 && styles.isDragged
			)}
			style={{
				'--x': props.bounds.x,
				'--y': props.bounds.y,
				'--width': props.bounds.width,
				'--height': props.bounds.height,
				// preview repositioning on drag
				transform: CSSUtil.Translate.toString(transform),
				// preview resizing on resize
				marginRight: -resizeDelta.x,
				marginBottom: -resizeDelta.y
			}}
			ref={setNodeRef}
			{...attributes}
			{...listeners}
			onClick={() => props.onSelect?.(props.bounds)}
			aria-hidden={true}
			// disable dnd-kit keyboard shortcuts since we have our own
			tabIndex={undefined}
			role={undefined}
			aria-describedby={undefined}
			aria-disabled={undefined}
			aria-roledescription={undefined}
			// title on hover
			title={
				props.selected
					? `Drag to move or use Alt/Option + Arrow keys.`
					: 'Click to select.'
			}
		>
			{/*Label*/}
			<div className={clsx(styles.widgetInstanceLabel)}>{props.id}</div>
			{/*Resize handle*/}
			{props.selected && (
				<DndContext
					onDragMove={evt => setResizeDelta(evt.delta)}
					onDragCancel={() => setResizeDelta({ x: 0, y: 0 })}
					onDragEnd={onResizeEnd}
				>
					<ResizeHandle />
				</DndContext>
			)}
		</div>
	);
}
