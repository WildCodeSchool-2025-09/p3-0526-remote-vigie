import FlashToast from "@/components/FlashToast/FlashToast";
import { useAuth } from "@/contexts/auth/AuthContext";

// Bienvenue affichée quelques secondes après une connexion ou une inscription
// avec Google (US22), déclenchée par navigate("/", { state: { welcome: true } }).
export default function WelcomeToast() {
	const { user } = useAuth();

	return (
		<FlashToast
			stateKey="welcome"
			message={user == null ? null : `Bienvenue ${user.pseudo} !`}
		/>
	);
}
