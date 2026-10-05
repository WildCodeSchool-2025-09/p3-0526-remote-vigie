import backgroundIncident from "@/assets/images/background-incident.jpg";
import BadgeCollection from "@/components/BadgeCollection/BadgeCollection";
import EmailNotVerifiedBanner from "@/components/EmailNotVerifiedBanner/EmailNotVerifiedBanner";
import Icon from "@/components/Icon/Icon";
import { useAuth } from "@/contexts/auth/AuthContext";
import badgeService from "@/services/badgeService";
import type { Badge } from "@/types/badge";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";

type ViewState =
	| { status: "loading" }
	| { status: "error" }
	| { status: "ok"; badges: Badge[] };

function BadgesSkeleton() {
	return (
		<div className="flex flex-col gap-3" aria-hidden="true">
			{[0, 1, 2].map((index) => (
				<div
					key={index}
					className="flex items-center gap-3 rounded-2xl bg-base-300 p-3"
				>
					<div className="skeleton size-20 shrink-0 rounded-2xl" />
					<div className="min-w-0 grow space-y-2">
						<div className="skeleton h-5 w-1/2 rounded" />
						<div className="skeleton h-3 w-3/4 rounded" />
						<div className="skeleton h-3 w-1/3 rounded" />
					</div>
				</div>
			))}
		</div>
	);
}

export default function ProfileBadges() {
	const { user } = useAuth();
	const showsEmailBanner = user != null && !user.emailVerified;
	const [state, setState] = useState<ViewState>({ status: "loading" });

	const loadBadges = useCallback(() => {
		let ignore = false;
		setState({ status: "loading" });

		badgeService
			.getMyBadges()
			.then((badges) => {
				if (!ignore) setState({ status: "ok", badges });
			})
			.catch(() => {
				if (!ignore) setState({ status: "error" });
			});

		return () => {
			ignore = true;
		};
	}, []);

	useEffect(() => loadBadges(), [loadBadges]);

	return (
		<main className="min-h-full bg-base-100 pb-10">
			<header className="relative isolate flex h-44 flex-col justify-end overflow-hidden bg-primary px-4 pt-4 pb-16">
				<img
					src={backgroundIncident}
					alt=""
					aria-hidden="true"
					className="absolute inset-0 -z-10 h-full w-full object-cover opacity-60 mix-blend-multiply"
				/>
				<div className="flex items-center gap-3">
					<Link
						to="/profile"
						className="btn btn-square btn-md rounded-xl border-2 border-white bg-white/20 shadow-none hover:bg-white/50"
						aria-label="Retour au profil"
					>
						<Icon
							name="arrowSmallLeft"
							className="h-4 w-4 fill-white"
							aria-hidden="true"
						/>
					</Link>
					<h1 className="font-title text-2xl font-bold text-accent">
						Mes badges
					</h1>
				</div>
			</header>
			<EmailNotVerifiedBanner />
			<div
				className={`relative mx-4 flex flex-col gap-4 rounded-3xl bg-base-200 px-5 pt-6 pb-8 ${showsEmailBanner ? "mt-4" : "-mt-8"}`}
			>
				<div aria-live="polite">
					{state.status === "loading" && <BadgesSkeleton />}

					{state.status === "error" && (
						<div className="flex flex-col gap-3 rounded-2xl bg-(--bg-error) p-4">
							<div className="flex items-start gap-3">
								<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-error">
									<Icon
										name="exclamation"
										className="h-3.5 w-3.5 fill-white"
										aria-hidden="true"
									/>
								</span>
								<div>
									<h2 className="font-title text-lg font-bold text-(--error-text)">
										Impossible d'afficher vos badges
									</h2>
									<p className="mt-1 text-sm text-secondary/70">
										La connexion au serveur a échoué.
										Réessayez dans un instant.
									</p>
								</div>
							</div>
							<button
								type="button"
								onClick={loadBadges}
								className="btn btn-md rounded-full border-none bg-error px-5 font-bold text-white"
							>
								Réessayer
							</button>
						</div>
					)}

					{state.status === "ok" && (
						<BadgeCollection badges={state.badges} />
					)}
				</div>
			</div>
		</main>
	);
}
