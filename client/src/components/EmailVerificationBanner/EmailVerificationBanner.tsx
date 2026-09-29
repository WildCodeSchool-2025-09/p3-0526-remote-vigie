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

	const handleResend = async () => {
		setSending(true);
		await resendVerification(email);
		setSending(false);
		setSent(true);
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
				Pour finaliser votre inscription et pouvoir vous connecter,
				consultez votre boîte de réception et cliquez sur le lien de
				vérification que nous vous avons envoyé.
			</p>
			<button
				type="button"
				onClick={handleResend}
				disabled={sending || sent}
				className="btn btn-accent btn-sm mt-1 rounded-full border-none px-5 font-bold"
			>
				{sent ? "E-mail renvoyé" : "Renvoyer l'e-mail"}
			</button>
		</section>
	);
}
