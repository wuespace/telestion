import { useEffect, useState } from 'react';

export function ErrorWidget() {
	const [showError, setShowError] = useState(false);
	useEffect(() => {
		const timeout = setTimeout(() => {
			setShowError(true);
		}, 3_000);
		return () => clearTimeout(timeout);
	}, []);

	if (showError) {
		throw new Error(
			`Test error thrown by the error widget at ${new Date().toISOString()}`
		);
	}

	return (
		<div>
			<h1>This widget will throw an error after three seconds</h1>
			<p>It is used to test the error handling of the dashboard.</p>
		</div>
	);
}
