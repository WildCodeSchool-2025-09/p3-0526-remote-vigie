import googleLogo from "@/assets/images/google-logo.svg";
import { useState } from "react";

// Lien vers la connexion Google (US22). Il passe par le serveur Vigie, qui
// redirige vers Google : le front ne contacte jamais Google directement.
export default function GoogleButton() {
	const [redirecting, setRedirecting] = useState(false);

	return (
		<a
			href={`${import.meta.env.VITE_API_URL}/api/auth/google`}
			onClick={() => setRedirecting(true)}
			aria-busy={redirecting}
			className="btn btn-md w-full rounded-full border-2 border-primary/60 bg-base-300 font-bold text-primary shadow-none hover:bg-base-100"
		>
			{redirecting ? (
				<span
					className="loading loading-spinner loading-sm"
					aria-hidden="true"
				/>
			) : (
				<img src={googleLogo} alt="" className="h-5 w-5" />
			)}
			{redirecting ? "Redirection vers Google…" : "Continuer avec Google"}
		</a>
	);
}
