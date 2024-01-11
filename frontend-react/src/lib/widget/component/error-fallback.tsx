import { Alert, AlertHeading, Button } from 'react-bootstrap';
import styles from './error-fallback.module.css';

export function ErrorFallback({
	error,
	resetErrorBoundary
}: {
	error: Error;
	resetErrorBoundary: () => void;
}) {
	return (
		<Alert variant="danger" className={styles.alert}>
			<AlertHeading>Widget Error</AlertHeading>
			<p>
				Unfortunately, the widget encountered an error and cannot be displayed.
			</p>
			<p>Please try again or contact your developer if the problem persists.</p>
			<details>
				<summary>Details</summary>
				<pre>{error.stack}</pre>
			</details>
			<Button
				className={'mt-4'}
				variant={'outline-light'}
				onClick={resetErrorBoundary}
			>
				Reload the widget
			</Button>
		</Alert>
	);
}
