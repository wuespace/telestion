import { useState } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import { Form as RRForm } from 'react-router-dom';

import { UserData } from '../../../../user-data';
import { getUser } from '../../../../auth';

export interface MigrationDialogProps {
	isOpen: boolean;
	onClose: () => void;
	migrationState: {
		oldUserData: UserData;
		previousVersion: string;
		currentVersion: string;
	};
}

export function MigrationDialog({
	isOpen,
	onClose,
	migrationState
}: MigrationDialogProps) {
	const [hasDownloaded, setHasDownloaded] = useState(false);
	const [isChecked, setIsChecked] = useState(false);
	const file = new Blob([JSON.stringify(migrationState.oldUserData)], {
		type: 'application/json'
	});
	const user = getUser();

	if (!user) {
		throw new Error('User is undefined. Library error: dd86ab60');
	}

	return (
		<Modal show={isOpen} onHide={onClose} centered>
			<Modal.Header>
				<Modal.Title>Migrate data</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<p>
					Are you sure you want to migrate your configuration data? This process
					cannot be undone!
				</p>
				<a
					className="btn btn-secondary"
					href={URL.createObjectURL(file)}
					download={`${user.username}-${migrationState.previousVersion}.json`}
					onClick={() => {
						setHasDownloaded(true);
					}}
				>
					<i className="bi bi-database-fill-down"></i> Download current data as
					backup
				</a>
				<Form.Check
					className="mt-3"
					type="checkbox"
					id="migration-without-backup"
					label="Migrate without downloading a backup (this isn't recommended and might lead to data loss!)"
					checked={isChecked}
					onChange={event => {
						setIsChecked(event.target.checked);
					}}
				/>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={onClose}>
					Cancel
				</Button>
				<RRForm method="POST">
					<Button
						variant="primary"
						disabled={!(hasDownloaded || isChecked)}
						type="submit"
						name="action"
						value="existing"
					>
						Migrate
					</Button>
				</RRForm>
			</Modal.Footer>
		</Modal>
	);
}
