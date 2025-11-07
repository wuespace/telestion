import { z } from 'zod';
import {
	Form as RRForm,
	useActionData,
	useLoaderData,
	useNavigation
} from 'react-router-dom';
import { Alert, Button, Card, Form, Spinner } from 'react-bootstrap';

import styles from './login-page.module.css';
import logo from '../../media/default-app-logo.png';

const loaderSchema = z.object({
	defaultBackendUrl: z.url().optional()
});

const actionSchema = z
	.object({
		errors: z.object({
			natsUrl: z.string().optional(),
			username: z.string().optional(),
			password: z.string().optional(),
			general: z.string().optional()
		}),
		values: z.object({
			natsUrl: z.string().optional(),
			username: z.string().optional()
		})
	})
	.optional();

export function LoginPage() {
	const { defaultBackendUrl } = loaderSchema.parse(useLoaderData());
	const action = actionSchema.parse(useActionData());
	const { state } = useNavigation();
	const isSubmitting = state !== 'idle';
	const isValidated = !!action && !isSubmitting;

	return (
		<div className={styles.container}>
			<Card body={true}>
				<img src={logo} alt="Application logo" className={styles.logo} />
				<h2>Telestion Application</h2>
				<p>
					Please enter the credentials assigned to you by the Ground Station
					team
				</p>

				{isValidated && action.errors.general && (
					<Alert variant="danger">{action.errors.general}</Alert>
				)}

				<Form as={RRForm} method="POST">
					<Form.Group className="mb-3" controlId="natsUrl">
						<Form.Label>Backend Server</Form.Label>
						<Form.Control
							type="url"
							name="natsUrl"
							defaultValue={action?.values.natsUrl ?? defaultBackendUrl}
							required
							disabled={isSubmitting}
							isInvalid={isValidated && !!action.errors.natsUrl}
						/>
						{isValidated && action.errors.natsUrl && (
							<Form.Control.Feedback type="invalid">
								{action.errors.natsUrl}
							</Form.Control.Feedback>
						)}
					</Form.Group>

					<Form.Group className="mb-3" controlId="username">
						<Form.Label>Username</Form.Label>
						<Form.Control
							type="text"
							name="username"
							required
							disabled={isSubmitting}
							defaultValue={action?.values.username}
							isInvalid={isValidated && !!action.errors.username}
						/>
						{isValidated && action.errors.username && (
							<Form.Control.Feedback type="invalid">
								{action.errors.username}
							</Form.Control.Feedback>
						)}
					</Form.Group>

					<Form.Group className="mb-3" controlId="password">
						<Form.Label>Password</Form.Label>
						<Form.Control
							type="password"
							name="password"
							required
							disabled={isSubmitting}
							isInvalid={isValidated && !!action.errors.password}
						/>
						{isValidated && action.errors.password && (
							<Form.Control.Feedback type="invalid">
								{action.errors.password}
							</Form.Control.Feedback>
						)}
					</Form.Group>

					<Button variant="primary" type="submit" disabled={isSubmitting}>
						{isSubmitting ? (
							<>
								<Spinner
									as="span"
									animation="border"
									size="sm"
									role="status"
									aria-hidden="true"
								/>{' '}
								Logging in...
							</>
						) : (
							'Login'
						)}
					</Button>
				</Form>
			</Card>
		</div>
	);
}
