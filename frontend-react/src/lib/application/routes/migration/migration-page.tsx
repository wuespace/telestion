import { useState } from 'react';
import { z } from 'zod';
import { useLoaderData, useSubmit } from 'react-router-dom';
import { Card } from 'react-bootstrap';

import { userDataSchema } from '../../../user-data';
import { PromptAction } from './model.ts';
import {
	NewUserPrompt,
	ExistingUserPrompt,
	ImportDialog,
	MigrationDialog
} from './components';

import styles from './migration-page.module.css';

const loaderDataSchema = z.object({
	migrationState: z
		.object({
			previousVersion: z.string(),
			currentVersion: z.string(),
			oldUserData: userDataSchema
		})
		.optional(),
	isDefaultAvailable: z.boolean()
});

export function MigrationPage() {
	const [migrationDialogState, setMigrationDialogState] = useState(false);
	const [importDialogState, setImportDialogState] = useState(false);

	// Note: versions is not defined if no user data is available
	const { migrationState, isDefaultAvailable } =
		loaderDataSchema.parse(useLoaderData());
	const submit = useSubmit();

	const handle = (action: PromptAction) => {
		switch (action) {
			case 'blank':
				submit({ action: 'blank' }, { method: 'post' });
				return;
			case 'default':
				submit({ action: 'default' }, { method: 'post' });
				return;
			case 'import':
				setImportDialogState(true);
				return;
			case 'existing':
				setMigrationDialogState(true);
				return;
		}
	};

	return (
		<div className={styles.container}>
			<Card body={true}>
				{migrationState ? (
					<>
						<ExistingUserPrompt
							isDefaultAvailable={isDefaultAvailable}
							onClick={handle}
							migrationState={migrationState}
						/>
						<MigrationDialog
							isOpen={migrationDialogState}
							onClose={() => setMigrationDialogState(false)}
							migrationState={migrationState}
						/>
					</>
				) : (
					<>
						<NewUserPrompt
							isDefaultAvailable={isDefaultAvailable}
							onClick={handle}
						/>
						<ImportDialog
							isOpen={importDialogState}
							onClose={() => setImportDialogState(false)}
						/>
					</>
				)}
			</Card>
		</div>
	);
}
