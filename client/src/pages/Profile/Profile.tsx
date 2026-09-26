import backgroundIncident from "@/assets/images/background-incident.jpg";
import { useAuth } from "@/contexts/auth/AuthContext";
import { useNavigate } from "react-router";

export default function Profile() {
	const { user, logout } = useAuth();
	const navigate = useNavigate();

	const handleLogout = () => {
		logout();
		navigate("/", { replace: true });
	};

	return (
		<main className="min-h-full bg-base-100 pb-10">
			<header className="relative isolate overflow-hidden bg-primary px-4 pt-8 pb-14">
				<img
					src={backgroundIncident}
					alt=""
					aria-hidden="true"
					className="absolute inset-0 -z-10 h-full w-full object-cover opacity-60 mix-blend-multiply"
				/>
				<h1 className="font-title text-2xl font-bold text-accent">
					Mon profil
				</h1>
			</header>

			<div className="relative mx-4 -mt-8 flex flex-col gap-6 rounded-3xl bg-base-200 px-5 pt-6 pb-8">
				<p className="text-primary">
					Connecté en tant que <strong>{user?.pseudo}</strong>
				</p>
				<button
					type="button"
					onClick={handleLogout}
					className="btn btn-accent btn-md w-full rounded-full border-none font-bold"
				>
					Se déconnecter
				</button>
			</div>
		</main>
	);
}
