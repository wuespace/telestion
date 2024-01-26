import { useDraggable } from '@dnd-kit/core';

import styles from './layout-editor.module.css';

export function ResizeHandle() {
	const { attributes, listeners, setNodeRef } = useDraggable({
		id: 'resize-handle'
	});

	return (
		<div
			className={styles.resizeHandle}
			ref={setNodeRef}
			{...attributes}
			{...listeners}
			aria-hidden={true}
			// disable dnd-kit keyboard shortcuts since we have our own
			tabIndex={undefined}
			role={undefined}
			aria-describedby={undefined}
			aria-disabled={undefined}
			aria-roledescription={undefined}
			// title on hover
			title={`Drag to resize or use Alt/Option + Shift + Arrow keys.`}
		/>
	);
}
