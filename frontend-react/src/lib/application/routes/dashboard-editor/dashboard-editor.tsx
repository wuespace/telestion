import { z } from 'zod';
import {
	Form,
	useActionData,
	useLoaderData,
	useSubmit
} from 'react-router-dom';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { clsx } from 'clsx';
import {
	Alert,
	Button,
	FormControl,
	FormGroup,
	FormLabel,
	FormSelect,
	FormText
} from 'react-bootstrap';

import {
	dashboardSchema,
	widgetInstanceSchema
} from '@wuespace/telestion/user-data';
import { generateDashboardId } from '@wuespace/telestion/utils';
import { getWidgetById, getWidgets } from '@wuespace/telestion/widget';
import { WidgetConfigurationContextProvider } from '@wuespace/telestion/widget/configuration/configuration-context.tsx';
import {
	LayoutEditor,
	LayoutEditorState,
	selectedWidgetId as getSelectedWidgetId
} from './layout-editor';

import styles from './dashboard-editor.module.scss';

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
	const submit = useSubmit();
	const errors = actionSchema.parse(useActionData());

	const {
		localDashboard,
		setLocalDashboard,
		localWidgetInstances,
		setLocalWidgetInstances,
		dashboardTitle,
		setDashboardTitle,
		selectedWidgetInstance,
		selectedWidgetId,
		selectedWidgetType,
		configuration,
		dashboardId
	} = useDashboardEditorData();

	const onLayoutEditorCreateWidgetInstance = useCallback(() => {
		const newId = generateDashboardId();
		const widgetTypes = getWidgets();
		const widgetType = widgetTypes[0];

		const configuration = widgetType.createConfig({});
		const type = widgetType.id;

		setLocalWidgetInstances(oldLocalWidgetInstances => ({
			...oldLocalWidgetInstances,
			[newId]: {
				type,
				configuration
			}
		}));

		return newId;
	}, [setLocalWidgetInstances]);

	const onWidgetInstanceTypeChange = useCallback(
		(event: ChangeEvent<HTMLSelectElement>) => {
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
			selectedWidgetInstance?.configuration,
			setLocalWidgetInstances
		]
	);
	const onDeleteDashboard = useCallback(() => {
		if (
			!window.confirm(
				`Are you sure you want to delete the dashboard "${dashboardTitle}" (ID: ${dashboardId})?`
			)
		)
			return;
		submit(null, { method: 'DELETE' });
	}, [dashboardId, dashboardTitle, submit]);

	const onConfigurationChange = (
		newConfig: z.infer<typeof widgetInstanceSchema.shape.configuration>
	) => {
		const selectedWidgetId = getSelectedWidgetId(localDashboard);
		if (!selectedWidgetId) throw new Error(`No widget selected`);

		setLocalWidgetInstances({
			...localWidgetInstances,
			[selectedWidgetId]: {
				...localWidgetInstances[selectedWidgetId],
				configuration: newConfig
			}
		});
	};

	return (
		<Form
			method="POST"
			id="dashboard-editor"
			className={clsx(styles.dashboardEditor)}
		>
			<section className={clsx(styles.dashboard, 'p-3')}>
				<h2>Dashboard Metadata</h2>
				{errors && (
					<Alert variant="danger">
						{errors.errors.layout && <p>{errors.errors.layout}</p>}
					</Alert>
				)}
				<FormGroup className={clsx('mb-3')}>
					<FormLabel>Dashboard ID</FormLabel>
					<FormControl readOnly name="dashboardId" value={dashboardId} />
				</FormGroup>
				<FormGroup className={clsx('mb-3')}>
					<FormLabel>Dashboard Title</FormLabel>
					<FormControl
						name="title"
						value={dashboardTitle}
						onChange={event => setDashboardTitle(event.target.value)}
					/>
				</FormGroup>
				<h3>Danger Zone</h3>
				<Button variant="danger" onClick={onDeleteDashboard}>
					Delete Dashboard
				</Button>
			</section>
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
				<section className="px-3">
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
							onChange={onWidgetInstanceTypeChange}
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
				</section>
			</section>
			<section className={clsx(styles.widgetInstance)}>
				<h2 className="p-3 pb-0">Widget Configuration</h2>
				{selectedWidgetId ? (
					<WidgetConfigurationContextProvider
						value={configuration}
						onChange={onConfigurationChange}
						createConfig={x => selectedWidgetType?.createConfig(x) ?? x}
					>
						{selectedWidgetType?.configElement}
					</WidgetConfigurationContextProvider>
				) : (
					<p className="px-3">Select a widget to configure it.</p>
				)}
			</section>
		</Form>
	);
}

/**
 * Stores a local working copy of the dashboard data that can be used before
 * submitting the form.
 *
 * @returns the local working copy of the dashboard data
 */
function useDashboardEditorData() {
	const loaderData = useLoaderData();
	const [localDashboard, setLocalDashboard] = useState<LayoutEditorState>({
		layout: [['.']],
		selection: {
			x: 0,
			y: 0
		}
	});
	const [localWidgetInstances, setLocalWidgetInstances] = useState<
		z.infer<typeof loaderSchema.shape.widgetInstances>
	>({});
	const [dashboardId, setDashboardId] = useState('');
	const [dashboardTitle, setDashboardTitle] = useState('');

	// create the local working copy of the data whenever the loader data changes
	useEffect(() => {
		const { dashboardId, dashboard, widgetInstances } =
			loaderSchema.parse(loaderData);

		setLocalDashboard({
			selection: {
				x: 0,
				y: 0
			},
			layout: dashboard.layout
		});
		setLocalWidgetInstances(widgetInstances);
		setDashboardId(dashboardId);
		setDashboardTitle(dashboard.title);
	}, [loaderData]);

	const selectedWidgetId = getSelectedWidgetId(localDashboard);
	const selectedWidgetInstance = !selectedWidgetId
		? undefined
		: localWidgetInstances[selectedWidgetId];

	const configuration = selectedWidgetInstance?.configuration ?? {};

	const selectedWidgetType = getWidgetById(selectedWidgetInstance?.type ?? '');

	return {
		localDashboard,
		setLocalDashboard,
		localWidgetInstances,
		setLocalWidgetInstances,
		dashboardTitle,
		setDashboardTitle,
		selectedWidgetInstance,
		selectedWidgetId,
		configuration,
		selectedWidgetType,
		dashboardId
	};
}
