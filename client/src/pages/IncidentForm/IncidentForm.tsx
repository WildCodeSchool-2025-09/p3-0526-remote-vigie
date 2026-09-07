import EmailVerificationNotice from "@/components/EmailVerificationNotice/EmailVerificationNotice";
import { useAuth } from "@/contexts/AuthContext";

export default function IncidentForm() {
	const { user } = useAuth();

	// PrivateRoute a déjà filtré les non-connectés : ici `user` existe.
	// S'il n'a pas vérifié son e-mail, on bloque le signalement.
	if (!user?.emailVerified) {
		return <EmailVerificationNotice />;
	}

	return <h1> Incident form</h1>;
}
