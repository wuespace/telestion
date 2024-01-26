import { useCallback, useId, useState } from 'react';
import { Alert, Button, Form, Modal } from 'react-bootstrap';

export function ResizeButton(props: {
	onResizeGrid: (width: number, height: number) => void;
	defaultWidth: number;
	defaultHeight: number;
}) {
	const [showResizeModal, setShowResizeModal] = useState(false);
	const onResizeModalCancel = useCallback(() => {
		setShowResizeModal(false);
	}, []);
	const onShowResizeModal = useCallback(() => {
		setShowResizeModal(true);
	}, []);

	const onResizeFormSubmit = useCallback(
		(event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();

			const form = event.currentTarget;
			const data = new FormData(form);
			const width = Number(data.get('columns'));
			const height = Number(data.get('rows'));

			props.onResizeGrid(width, height);
			setShowResizeModal(false);
		},
		[props]
	);
	const formId = useId();

	return (
		<>
			<Button variant="secondary" onClick={onShowResizeModal}>
				<i className="bi bi-aspect-ratio"></i>
				&nbsp; Resize Grid
			</Button>
			<Modal show={showResizeModal} onHide={onResizeModalCancel}>
				<Modal.Header closeButton>
					<Modal.Title>
						<i className="bi bi-aspect-ratio"></i>
						&nbsp; Resize Grid
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{/*Warning about widget instances getting lost*/}
					<Alert variant="warning">
						Resizing the grid will remove all widget instances that are outside
						of the new grid.
					</Alert>
					{/*	Form for selecting new column and row count */}
					<Form onSubmit={onResizeFormSubmit} id={formId}>
						<Form.Group>
							<Form.Label>Columns</Form.Label>
							<Form.Control
								type="number"
								name="columns"
								min={1}
								max={24}
								placeholder="Columns"
								defaultValue={props.defaultWidth}
							/>
						</Form.Group>
						<Form.Group>
							<Form.Label>Rows</Form.Label>
							<Form.Control
								type="number"
								name="rows"
								min={1}
								max={24}
								placeholder="Rows"
								defaultValue={props.defaultHeight}
							/>
						</Form.Group>
					</Form>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={onResizeModalCancel}>
						Cancel
					</Button>
					<Button variant="primary" type={'submit'} form={formId}>
						Resize
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
}
