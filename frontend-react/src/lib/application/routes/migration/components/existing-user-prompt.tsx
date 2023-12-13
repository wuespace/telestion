import { PromptAction } from '../model.ts';
import { Button, Stack } from 'react-bootstrap';

import { UserData } from '../../../../user-data';

export interface ExistingUserPrompt {
	isDefaultAvailable: boolean;
	onClick: (action: PromptAction) => void;
	migrationState: {
		oldUserData: UserData;
		previousVersion: string;
		currentVersion: string;
	};
}

export function ExistingUserPrompt({
	isDefaultAvailable,
	onClick,
	migrationState
}: ExistingUserPrompt) {
	const actionText = `You can try to migrate your existing configuration, ${
		isDefaultAvailable && 'replace it with the default configuration, '
	}or import a configuration from a file.`;

	return (
		<>
			<h2>Great to see you again!</h2>
			<p>
				It looks like the developers have been active! They have released a
				brand-new version of Telestion Ground Station.
			</p>
			<dl>
				<dt>Previous version:</dt>
				<dd>{migrationState.previousVersion}</dd>
				<dt>New version:</dt>
				<dd>{migrationState.currentVersion}</dd>
			</dl>
			<p>{actionText}</p>

			<Stack direction="horizontal" gap={2}>
				<Button variant="primary" onClick={() => onClick('existing')}>
					Migrate previous
				</Button>
				{isDefaultAvailable && (
					<Button variant="secondary" onClick={() => onClick('default')}>
						Load default
					</Button>
				)}
				<Button variant="secondary" onClick={() => onClick('import')}>
					Import from file
				</Button>
			</Stack>
		</>
	);
}
