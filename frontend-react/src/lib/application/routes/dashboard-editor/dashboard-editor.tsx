import { z } from 'zod';
import { dashboardSchema, widgetInstanceSchema } from '../../../user-data';
import { Form, useActionData, useLoaderData } from 'react-router-dom';
import { useCallback, useState } from 'react';
import {
	LayoutEditor,
	LayoutEditorState,
	selectedWidgetId as getSelectedWidgetId
} from './layout-editor';
import styles from './dashboard-editor.module.scss';
import { clsx } from 'clsx';
import {
	Alert,
	FormControl,
	FormGroup,
	FormLabel,
	FormSelect,
	FormText
} from 'react-bootstrap';
import { generateDashboardId } from '@wuespace/telestion/utils';
import { getWidgetById, getWidgets } from '@wuespace/telestion/widget';

const loaderSchema = z.object({
	dashboardId: z.string(),
	dashboard: dashboardSchema,
	widgetInstances: z.record(z.string(), widgetInstanceSchema)
});

const actionSchema = z
	.object({
		errors: z.object({
			layout: z.string().optional()
		})
	})
	.optional();

export function DashboardEditor() {
	const { dashboardId, dashboard, widgetInstances } =
		loaderSchema.parse(useLoaderData());
	const errors = actionSchema.parse(useActionData());

	const [localDashboard, setLocalDashboard] = useState<LayoutEditorState>({
		layout: dashboard.layout,
		selection: {
			x: 0,
			y: 0
		}
	});

	const [localWidgetInstances, setLocalWidgetInstances] =
		useState(widgetInstances);
	const onLayoutEditorCreateWidgetInstance = useCallback(() => {
		const newId = generateDashboardId();
		const widgetTypes = getWidgets();
		const widgetType = widgetTypes[0];

		const configuration = widgetType.createConfig({});
		const type = widgetType.id;

		setLocalWidgetInstances({
			...localWidgetInstances,
			[newId]: {
				type,
				configuration
			}
		});

		return newId;
	}, [localWidgetInstances]);

	const selectedWidgetId = getSelectedWidgetId(localDashboard);
	const selectedWidgetInstance = !selectedWidgetId
		? undefined
		: localWidgetInstances[selectedWidgetId];

	const onFormSelectChange = useCallback(
		(event: React.ChangeEvent<HTMLSelectElement>) => {
			const value = event.target.value;
			const widgetType = getWidgetById(value);
			if (!widgetType) throw new Error(`Widget type ${value} not found`);

			const selectedWidgetId = getSelectedWidgetId(localDashboard);
			if (!selectedWidgetId) throw new Error(`No widget selected`);

			const configuration = widgetType.createConfig(
				selectedWidgetInstance?.configuration ?? {}
			);
			const type = widgetType.id;

			setLocalWidgetInstances({
				...localWidgetInstances,
				[selectedWidgetId]: {
					type,
					configuration
				}
			});
		},
		[
			localDashboard,
			localWidgetInstances,
			selectedWidgetInstance?.configuration
		]
	);

	return (
		<Form method="POST" id="dashboard-editor">
			<div className={clsx(styles.dashboardEditor)}>
				<div className={clsx(styles.dashboard, 'p-3')}>
					<h2>Dashboard Metadata</h2>
					{errors && (
						<Alert variant="danger">
							{errors.errors.layout && <p>{errors.errors.layout}</p>}
						</Alert>
					)}
					<FormGroup>
						<FormLabel>Dashboard ID</FormLabel>
						<FormControl readOnly name="dashboardId" value={dashboardId} />
					</FormGroup>
				</div>
				<section className={clsx(styles.layout)}>
					<h2 className={'p-3'}>Dashboard Layout</h2>
					<LayoutEditor
						value={localDashboard}
						onChange={setLocalDashboard}
						onCreateWidgetInstance={onLayoutEditorCreateWidgetInstance}
					/>
					<input
						type="hidden"
						name="layout"
						value={JSON.stringify(localDashboard.layout)}
					/>
					<input
						type="hidden"
						name="widgetInstances"
						value={JSON.stringify(localWidgetInstances)}
					/>
					<div className="px-3">
						<FormGroup className={clsx('mb-3')}>
							<FormLabel>Widget Instance ID</FormLabel>
							<FormControl
								readOnly
								disabled={!selectedWidgetId}
								value={selectedWidgetId ?? 'Select a widget instance above'}
							/>
							<FormText>
								This is primarily used by developers to reference the widget.
							</FormText>
						</FormGroup>
						<FormGroup className={clsx('mb-3')}>
							<FormLabel>Widget Instance Type</FormLabel>
							<FormSelect
								disabled={!selectedWidgetId}
								value={selectedWidgetInstance?.type ?? ''}
								onChange={onFormSelectChange}
							>
								{!selectedWidgetId && (
									<option value="" disabled>
										Select a widget to configure it.
									</option>
								)}
								{Object.values(getWidgets()).map(widget => (
									<option key={widget.id} value={widget.id}>
										{widget.label}
									</option>
								))}
							</FormSelect>
							<FormText>Set the type of the widget instance.</FormText>
						</FormGroup>
					</div>
				</section>
				<div className={clsx(styles.widgetInstance)}>
					<h2 className="p-3 pb-0">Widget Configuration</h2>
					{selectedWidgetId ? (
						<div className={clsx(styles.widgetInstanceContent)}>
							{getWidgetById(selectedWidgetInstance?.type ?? '')?.configElement}
						</div>
					) : (
						<main className="px-3">Select a widget to configure it.</main>
					)}
				</div>
			</div>
		</Form>
	);
}
