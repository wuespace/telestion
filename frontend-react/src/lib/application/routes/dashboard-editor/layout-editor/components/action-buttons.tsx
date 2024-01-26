import { Button, ButtonGroup } from 'react-bootstrap';

import { LayoutEditorProps, selectedWidgetId } from '..';

import styles from './layout-editor.module.css';
import { ResizeButton } from '@wuespace/telestion/application/routes/dashboard-editor/layout-editor/components/resize-button.tsx';

export function ActionButtons(
	props: LayoutEditorProps & {
		onDelete?: () => void;
		onResizeGrid?: (width: number, height: number) => void;
	}
) {
	const isSelected = selectedWidgetId(props.value) !== undefined;

	const width = props.value.layout[0].length;
	const height = props.value.layout.length;

	return (
		<div className={styles.actionButtons}>
			{/*Undo/Redio*/}
			<ButtonGroup>
				<Button variant="secondary" disabled={!props.onUndo}>
					<i className="bi bi-arrow-counterclockwise"></i>
					&nbsp; Undo
				</Button>
				<Button variant="secondary" disabled={!props.onRedo}>
					<i className="bi bi-arrow-clockwise"></i>
					&nbsp; Redo
				</Button>
			</ButtonGroup>
			{props.onResizeGrid && (
				<ResizeButton
					onResizeGrid={props.onResizeGrid}
					defaultWidth={width}
					defaultHeight={height}
				/>
			)}
			{/*	Delete selected*/}
			{props.onDelete && (
				<Button
					variant="danger"
					disabled={!isSelected}
					onClick={props.onDelete}
					title={
						isSelected
							? 'Delete the selected widget instance.'
							: 'Select a widget instance to delete.'
					}
				>
					<i className="bi bi-trash"></i>
					&nbsp; Delete Widget Instance
				</Button>
			)}
		</div>
	);
}
