import { z } from 'zod';
import {
	generatePath,
	Link,
	Outlet,
	useLoaderData,
	useMatch,
	useNavigation,
	useParams
} from 'react-router-dom';
import {
	Button,
	Container,
	Nav as BSNav,
	Navbar,
	Spinner
} from 'react-bootstrap';
import { clsx } from 'clsx';

import { userDataSchema } from '../../../user-data';
import { DashboardDropdown } from './dashboard-dropdown.tsx';

import styles from './page-wrapper.module.css';

const loaderDataSchema = z.object({
	dashboards: userDataSchema.shape.dashboards.optional()
});

const paramsSchema = z.object({
	dashboardId: z.string().optional()
});

export interface PageWrapperProps {
	/**
	 * Controls the visibility of the dashboard selector in the navigation bar.
	 */
	showSelector: boolean;
}

export function PageWrapper({ showSelector }: PageWrapperProps) {
	const { dashboards } = loaderDataSchema.parse(useLoaderData());
	const { dashboardId } = paramsSchema.parse(useParams());
	const match = useMatch('/dashboards/:dashboardId/edit');
	const navigation = useNavigation();
	const isLoggingOut =
		navigation.state === 'loading' &&
		navigation.location.pathname === '/logout';

	if (isLoggingOut) {
		return (
			<div className={styles.logoutContainer}>
				<Spinner animation="border" className={clsx(['m-4', styles.spinner])} />
				<p>Logging out...</p>
			</div>
		);
	}

	return (
		<Container fluid>
			<Navbar fixed="bottom" bg="body-tertiary" className={styles.nav}>
				<Container fluid>
					{/* only render on dashboard pages and when dashboards are defined */}
					{showSelector && !!dashboards && (
						<>
							<DashboardDropdown dashboards={dashboards} />
							{dashboardId &&
								(match ? (
									<Button size="sm" form="dashboard-editor" type="submit">
										Save
									</Button>
								) : (
									<Link
										className="btn btn-sm btn-secondary"
										to={generatePath('/dashboards/:dashboardId/edit', {
											dashboardId
										})}
									>
										Edit
									</Link>
								))}
						</>
					)}
					<Navbar.Toggle aria-controls="navbarScroll" />
					<Navbar.Collapse id="navbarScroll">
						<BSNav className="me-auto my-2 my-lg-0"></BSNav>
						<BSNav className="d-flex">
							<BSNav.Link className="d-flex" as={Link} to="/logout">
								<i className="bi bi-box-arrow-right"></i>
							</BSNav.Link>
						</BSNav>
					</Navbar.Collapse>
				</Container>
			</Navbar>
			<main className={styles.main}>
				<Outlet />
			</main>
		</Container>
	);
}
