import { z } from 'zod';
import { dashboardSchema } from '../../../user-data';
import { Form, useActionData, useLoaderData } from 'react-router-dom';

const loaderSchema = z.object({
	dashboardId: z.string(),
	dashboard: dashboardSchema
});

const actionSchema = z
	.object({
		errors: z.object({
			layout: z.string().optional()
		})
	})
	.optional();

export function DashboardEditor() {
	const { dashboardId, dashboard } = loaderSchema.parse(useLoaderData());
	const errors = actionSchema.parse(useActionData());

	// TODO: Implement dashboard editor
	console.log(errors);

	return (
		<>
			<div>Dashboard id: {dashboardId}</div>
			<Form method="POST" id="dashboard-editor">
				<input
					type="text"
					name="layout"
					defaultValue={JSON.stringify(dashboard.layout)}
				/>
				<button>Submit layout update</button>
			</Form>
		</>
	);
}
