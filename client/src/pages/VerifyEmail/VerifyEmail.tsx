import type { IconName } from "@/assets/icons";
import Icon from "@/components/Icon/Icon";
import { verifyEmail } from "@/services/userService";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

type Status = "pending" | "success" | "expired" | "error";

const STATUS_CONTENT: Record<
	Exclude<Status, "pending">,
	{ icon: IconName; iconClass: string; bgClass: string; title: string }
> = {
	success: {
		icon: "check",
		iconClass: "fill-success",
		bgClass: "bg-(--bg-success)",
		title: "E-mail vérifié",
	},
	expired: {
		icon: "exclamation",
		iconClass: "fill-warning",
		bgClass: "bg-(--bg-warning)",
		title: "Lien expiré",
	},
	error: {
		icon: "crossSmall",
		iconClass: "fill-error",
		bgClass: "bg-(--bg-error)",
		title: "Lien invalide",
	},
};

export default function VerifyEmail() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const [status, setStatus] = useState<Status>("pending");
	const [message, setMessage] = useState("");

	useEffect(() => {
		const token = searchParams.get("token");

		if (token == null) {
			setStatus("error");
			setMessage("Ce lien de vérification est invalide.");
			return;
		}

		let cancelled = false;

		verifyEmail(token).then((result) => {
			if (cancelled) return;
			setStatus(result.status);
			setMessage(result.message);
		});

		return () => {
			cancelled = true;
		};
	}, [searchParams]);

	return (
		<div className="flex min-h-dvh flex-col items-center justify-center bg-base-100 p-4">
			<h1 className="sr-only">Vérification d'e-mail</h1>
			<div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-3xl bg-base-300 p-4 text-center">
				{status === "pending" ? (
					<p className="text-sm text-black">Vérification en cours...</p>
				) : (
					<>
						{status === "success" && (
							<div className="flex flex-col items-center gap-2">
								<img
									src="/vigie-favicon.svg"
									alt=""
									aria-hidden="true"
									className="h-10 w-10"
								/>
								<p className="font-title text-xl font-bold text-primary">
									Bienvenue sur Vigie
								</p>
							</div>
						)}
						{status === "success" ? (
							<span className="relative flex h-16 w-16 items-center justify-center">
								<span
									className="absolute inset-2 animate-ping rounded-full bg-(--bg-success) [animation-duration:2s]"
									aria-hidden="true"
								/>
								<span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-(--bg-success)">
									<Icon
										name="check"
										className="block h-6 w-6 fill-success"
										aria-hidden="true"
									/>
								</span>
							</span>
						) : (
							<span
								className={`flex h-16 w-16 items-center justify-center rounded-full ${STATUS_CONTENT[status].bgClass}`}
							>
								<Icon
									name={STATUS_CONTENT[status].icon}
									className={`h-8 w-8 ${STATUS_CONTENT[status].iconClass}`}
									aria-hidden="true"
								/>
							</span>
						)}
						<h2 className="font-title text-lg font-bold text-primary">
							{STATUS_CONTENT[status].title}
						</h2>
						<p className="mt-1 text-sm text-black">{message}</p>

						<button
							type="button"
							onClick={() =>
								navigate(status === "success" ? "/login" : "/")
							}
							className="btn btn-accent btn-md w-full rounded-full border-none px-5 font-bold"
						>
							{status === "success" ? "Se connecter" : "Retour à l'accueil"}
						</button>
					</>
				)}
			</div>
		</div>
	);
}
