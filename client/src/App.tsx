import { Outlet, useLocation } from "react-router";
import "./index.css";
import NavBar from "./components/Navigation/NavBar/NavBar";
import { NotificationProvider } from "./contexts/Notification/NotificationContext";

function App() {
	const { pathname } = useLocation();
	const isDevHelpRoute =
		pathname === "/help" || pathname.startsWith("/help/");

	return (
		<NotificationProvider>
			<a
				href="#main-content"
				className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-(--primary) focus:px-4 focus:py-2 focus:text-(--bg-light) focus:no-underline"
			>
				Aller au contenu principal
			</a>
			{/* Structure globale */}
			<div className="flex h-dvh flex-col bg-(--bg-dark) lg:flex-row">
				<div
					id="main-content"
					tabIndex={-1}
					className="grow lg:min-w-0 lg:overflow-y-auto"
				>
					<Outlet />
				</div>
				{!isDevHelpRoute && <NavBar />}
			</div>
		</NotificationProvider>
	);
}

export default App;
