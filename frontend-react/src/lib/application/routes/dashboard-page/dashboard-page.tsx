import { z } from 'zod';
import { useLoaderData } from 'react-router-dom';
import { dashboardSchema } from '../../../user-data';
import { WidgetRenderer } from '../../../widget';

import styles from './dashboard-page.module.css';

const loaderSchema = z.object({
	dashboard: dashboardSchema
});

export function DashboardPage() {
	const { dashboard } = loaderSchema.parse(useLoaderData());

	// create CSS grid layout
	const cssLayout = `'${dashboard.layout
		.map(row => row.map(CSS.escape).join(' '))
		.join(`' '`)}'`;

	// extract all widgets referenced in layout
	const widgets = new Set(dashboard.layout.flat(2));
	widgets.delete('.');

	return (
		<main className={styles.grid} style={{ '--layout': cssLayout }}>
			{Array.from(widgets.values()).map(id => (
				<WidgetRenderer widgetInstanceId={id} key={id} />
			))}
		</main>
	);
}
