// Import necessary modules from React and React Router
import { Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import {
	Outlet,
	type RouteObject,
	RouterProvider,
	createBrowserRouter,
} from "react-router";

/* ************************************************************************* */

import App from "@/App";
import Details from "@/pages/Details/Details";
// Import the main app component
import Home from "@/pages/Home/Home";
import Incident from "@/pages/Incident/Incident";
import Login from "@/pages/Login/Login";
import Numbers from "@/pages/Numbers/Numbers";
import Profile from "@/pages/Profile/Profile";
import Register from "@/pages/Register/Register";

// DEV ONLY — pas des pages de l'app, voir src/_dev/README.md
// Le bloc `if (import.meta.env.DEV)` est tree-shaké par Vite dans un build de prod :
// ni les routes /help/*, ni le code des pages (dont react-markdown + mermaid pour
// ReadmeViewer) ne finissent dans le bundle déployé.
// https://vite.dev/guide/env-and-mode.html#production-replacement
let devRoutes: RouteObject[] = [];

if (import.meta.env.DEV) {
	const HelpIndex = lazy(() => import("@/_dev/HelpIndex"));
	const ReadmeViewer = lazy(() => import("@/_dev/ReadmeViewer"));
	const VigieViewer = lazy(() => import("@/_dev/VigieViewer"));
	const ColorPalette = lazy(() => import("@/_dev/ColorPalette"));
	const IconGallery = lazy(() => import("@/_dev/IconGallery"));
	const ComponentGallery = lazy(
		() => import("@/_dev/design-system/ComponentGallery"),
	);

	devRoutes = [
		{
			path: "help",
			// Suspense unique : couvre aussi tous les enfants (readme, vigie, colors, icons).
			element: (
				<Suspense fallback={null}>
					<Outlet />
				</Suspense>
			),
			children: [
				{
					index: true,
					element: <HelpIndex />,
				},
				{
					path: "readme",
					element: <ReadmeViewer />,
				},
				{
					path: "vigie",
					element: <VigieViewer />,
				},
				{
					path: "colors",
					element: <ColorPalette />,
				},
				{
					path: "icons",
					element: <IconGallery />,
				},
				{
					path: "components",
					element: <ComponentGallery />,
				},
			],
		},
	];
}

const router = createBrowserRouter([
	{
		element: <App />,
		children: [
			{
				index: true,
				element: <Home />,
			},
			{
				path: "numbers",
				element: <Numbers />,
			},
			{
				path: "incident",
				element: <Incident />,
			},
			{
				path: "incident/:id",
				element: <Details />,
			},
			{
				path: "profile",
				element: <Profile />,
			},
			{
				path: "login",
				element: <Login />,
			},
			{
				path: "register",
				element: <Register />,
			},
			...devRoutes,
		],
	},
]);

/* ************************************************************************* */

// Find the root element in the HTML document
const rootElement = document.getElementById("root");
if (rootElement == null) {
	throw new Error(
		`Your HTML Document should contain a <div id="root"></div>`,
	);
}

// Render the app inside the root element
createRoot(rootElement).render(<RouterProvider router={router} />);
