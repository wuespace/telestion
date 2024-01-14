import { forwardRef, useCallback } from 'react';
import { clsx } from 'clsx';

import { Bounds } from '../model/layout-editor-model.ts';

import styles from './layout-editor.module.css';

export const EmptyCell = forwardRef<
	HTMLDivElement,
	{
		y: number;
		x: number;
		onCreate?(bounds: Bounds): void;
	}
>(function EmptyCell(props, ref) {
	const onClick = useCallback(() => {
		props.onCreate?.({
			x: props.x,
			y: props.y,
			width: 1,
			height: 1
		});
	}, [props]);

	return (
		<div
			className={clsx(styles.emptyCell)}
			style={{
				'--x': props.x,
				'--y': props.y
			}}
			ref={ref}
			onClick={onClick}
			aria-hidden={true}
			title="Click to add a new widget instance here"
		>
			<i className={clsx('bi bi-plus-lg', styles.emptyCellContent)}></i>
		</div>
	);
});
