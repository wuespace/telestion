import { createBrowserRouter } from 'react-router-dom';
import { TelestionOptions } from './model.ts';

// Route elements, loaders, actions
import {
	rootLoader,
	loginAction,
	loginLoader,
	LoginPage,
	logoutLoader,
	PageWrapper,
	pageWrapperLoader,
	migrationLoader,
	MigrationPage,
	migrationAction,
	dashboardIndexLoader,
	DashboardIndexPage,
	DashboardPage,
	dashboardPageLoader,
	dashboardPageAction,
	DashboardEditor,
	dashboardEditorLoader,
	dashboardEditorAction,
	dashboardCreateAction
} from './routes';

export function createTelestionRouter(options: TelestionOptions): ReturnType<typeof createBrowserRouter> {
	return createBrowserRouter([
		{
			path: '/',
			loader: rootLoader(options)
		},
		{
			path: '/login',
			element: <LoginPage />,
			loader: loginLoader(options),
			action: loginAction()
		},
		{
			path: '/logout',
			loader: logoutLoader()
		},
		{
			path: '/migration',
			element: <PageWrapper showSelector={false} />,
			loader: pageWrapperLoader(),
			children: [
				{
					index: true,
					element: <MigrationPage />,
					loader: migrationLoader(options),
					action: migrationAction(options)
				}
			]
		},
		{
			path: '/dashboards',
			element: <PageWrapper showSelector={true} />,
			loader: pageWrapperLoader(),
			action: dashboardCreateAction(options),
			children: [
				{
					index: true,
					element: <DashboardIndexPage />,
					loader: dashboardIndexLoader(options),
					action: dashboardCreateAction(options)
				},
				{
					path: ':dashboardId',
					element: <DashboardPage />,
					loader: dashboardPageLoader(options),
					action: dashboardPageAction(options)
				},
				{
					path: ':dashboardId/edit',
					element: <DashboardEditor />,
					loader: dashboardEditorLoader(options),
					action: dashboardEditorAction(options)
				}
			]
		},
		{
			path: '/widgets',
			element: <PageWrapper showSelector={false} />,
			loader: pageWrapperLoader()
		}
	]);
}
