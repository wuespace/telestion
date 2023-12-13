import styles from './dashboard-index-page.module.css';
import { Button, Card } from 'react-bootstrap';
import { Form } from 'react-router-dom';

export function DashboardIndexPage() {
	return (
		<div className={styles.container}>
			<Card body={true}>
				<h2>It's empty here!</h2>
				<p>You currently don't have any dashboards to display.</p>
				<p>To start using the Ground Station, create your first dashboard.</p>

				<Form method="post">
					<Button type="submit" variant="primary">
						Create dashboard
					</Button>
				</Form>
			</Card>
		</div>
	);
}
