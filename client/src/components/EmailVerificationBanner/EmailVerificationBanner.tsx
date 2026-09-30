import { resendVerification } from "@/services/userService";
import { useState } from "react";

type EmailVerificationBannerProps = {
	email: string;
};

export default function EmailVerificationBanner({
	email,
}: EmailVerificationBannerProps) {
	const [sending, setSending] = useState(false);
	const [sent, setSent] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleResend = async () => {
		setSending(true);
		setError(null);
		const result = await resendVerification(email);
		setSending(false);

		if (result.status === "ok") {
			setSent(true);
			return;
		}

		setError(
			result.status === "tooManyRequests"
				? result.message
				: "Une erreur est survenue. Veuillez réessayer plus tard.",
		);
	};

	return (
		<section className="flex flex-col items-center gap-2 rounded-3xl bg-base-300 p-4 text-center">
			<img
				src="/vigie-favicon.svg"
				alt=""
				aria-hidden="true"
				className="h-8 w-8"
			/>
			<p className="font-title text-lg font-bold text-primary">
				Bienvenue sur Vigie
			</p>
			<p className="text-sm text-primary/70">
				Pour finaliser votre inscription, consultez votre boîte de
				réception et cliquez sur le lien de vérification que nous vous
				avons envoyé. Tant que votre e-mail n'est pas vérifié, certaines
				actions (comme signaler un incident) restent indisponibles.
			</p>
			<button
				type="button"
				onClick={handleResend}
				disabled={sending || sent}
				className="btn btn-accent btn-sm mt-1 rounded-full border-none px-5 font-bold"
			>
				{sent ? "E-mail renvoyé" : "Renvoyer l'e-mail"}
			</button>
			{error && (
				<p className="text-xs font-semibold text-error">{error}</p>
			)}
		</section>
	);
}
