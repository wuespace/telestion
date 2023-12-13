import { Button, Stack } from 'react-bootstrap';
import { PromptAction } from '../model.ts';

export interface NewUserBannerProps {
	isDefaultAvailable: boolean;
	onClick: (action: PromptAction) => void;
}

export function NewUserPrompt({
	isDefaultAvailable,
	onClick
}: NewUserBannerProps) {
	const actionText = `You can either ${
		isDefaultAvailable && 'load the default dashboards, '
	}start from scratch creating a custom dashboard, or import your own existing dashboard configuration from a file.`;

	return (
		<>
			<h2>Welcome!</h2>
			<p>
				Welcome to the Telestion Ground Station! It looks like this is your
				first time using the ground station and there aren't any dashboards.
			</p>
			<p>{actionText}</p>

			<Stack direction="horizontal" gap={2}>
				{isDefaultAvailable && (
					<Button variant="primary" onClick={() => onClick('default')}>
						Load default
					</Button>
				)}
				<Button
					variant={isDefaultAvailable ? 'secondary' : 'primary'}
					onClick={() => onClick('blank')}
				>
					Create blank dashboard
				</Button>
				<Button variant="secondary" onClick={() => onClick('import')}>
					Import from file
				</Button>
			</Stack>
		</>
	);
}
