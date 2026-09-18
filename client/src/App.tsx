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
			{/* Structure globale */}
			<div className="flex h-dvh flex-col bg-(--bg-dark)">
				<div className="grow">
					<Outlet />
				</div>
				{!isDevHelpRoute && <NavBar />}
			</div>
		</NotificationProvider>
	);
}

export default App;
