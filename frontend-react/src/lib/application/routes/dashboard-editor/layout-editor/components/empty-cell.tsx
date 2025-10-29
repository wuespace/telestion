import { Ref, useCallback } from 'react';
import { clsx } from 'clsx';

import { Bounds } from '../model/layout-editor-model.ts';

import styles from './layout-editor.module.css';

export function EmptyCell(props: {
	y: number;
	x: number;
	onCreate?(bounds: Bounds): void;
	ref?: Ref<HTMLDivElement>;
}) {
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
			// TODO: figure out why the linter fails without disabling it here and fix it
			// eslint-disable-next-line react-hooks/refs
			style={{
				// TODO: figure out why the linter fails without disabling it here and fix it
				// eslint-disable-next-line react-hooks/refs
				'--x': props.x,
				// TODO: figure out why the linter fails without disabling it here and fix it
				// eslint-disable-next-line react-hooks/refs
				'--y': props.y
			}}
			// TODO: figure out why the linter fails without disabling it here and fix it
			// eslint-disable-next-line react-hooks/refs
			ref={props.ref}
			onClick={onClick}
			aria-hidden={true}
			title="Click to add a new widget instance here"
		>
			<i className={clsx('bi bi-plus-lg', styles.emptyCellContent)}></i>
		</div>
	);
}
