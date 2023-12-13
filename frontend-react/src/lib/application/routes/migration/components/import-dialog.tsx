import { z } from 'zod';
import { Form as RRForm, useActionData } from 'react-router-dom';
import { Alert, Button, Form, Modal } from 'react-bootstrap';

const actionSchema = z
	.object({
		errors: z.object({
			import: z.string().optional()
		})
	})
	.optional();

export interface ImportDialogProps {
	isOpen: boolean;
	onClose: () => void;
}

export function ImportDialog({ isOpen, onClose }: ImportDialogProps) {
	const action = actionSchema.parse(useActionData());

	return (
		<Modal show={isOpen} onHide={onClose} centered>
			<Modal.Header>
				<Modal.Title>Import from file</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{action?.errors.import && (
					<Alert variant="danger">{action.errors.import}</Alert>
				)}
				<p>Please select a file that contains your exported user data:</p>
				<Form
					as={RRForm}
					id="import-form"
					method="POST"
					encType="multipart/form-data"
				>
					<Form.Group className="mb-3" controlId="userdata">
						<Form.Control
							type="file"
							name="userdata"
							accept="application/json"
							required
						/>
					</Form.Group>
				</Form>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={onClose}>
					Cancel
				</Button>
				<Button
					variant="primary"
					type="submit"
					form="import-form"
					name="action"
					value="import"
				>
					Import
				</Button>
			</Modal.Footer>
		</Modal>
	);
}
