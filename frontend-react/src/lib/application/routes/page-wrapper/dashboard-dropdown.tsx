import { z } from 'zod';
import { generatePath, Link, useParams, useSubmit } from 'react-router-dom';
import { NavDropdown } from 'react-bootstrap';

import { UserData } from '../../../user-data';

const paramsSchema = z.object({
	dashboardId: z.string().optional()
});

export interface DashboardDropdownProps {
	dashboards: UserData['dashboards'];
}

export function DashboardDropdown({ dashboards }: DashboardDropdownProps) {
	const submit = useSubmit();
	const { dashboardId } = paramsSchema.parse(useParams());

	return (
		<NavDropdown
			title={dashboardId ? dashboards[dashboardId].title : 'Nothing selected'}
			id="dashboard-nav"
			drop="up"
		>
			{Object.entries(dashboards).map(dashboard => (
				<NavDropdown.Item
					key={dashboard[0]}
					as={Link}
					to={generatePath('/dashboards/:dashboardId', {
						dashboardId: dashboard[0]
					})}
				>
					{dashboard[1].title}
				</NavDropdown.Item>
			))}
			<NavDropdown.Divider />
			<NavDropdown.Item onClick={() => void submit(null, { method: 'post' })}>
				New Dashboard...
			</NavDropdown.Item>
		</NavDropdown>
	);
}
