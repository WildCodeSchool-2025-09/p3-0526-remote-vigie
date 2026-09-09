import bgIncident from "@/assets/images/background-incident.jpg";
import Icon from "@/components/Icon/Icon";

export default function EmailVerificationNotice() {
	return (
		<div className="INCIDENT-FORM-PAGE min-h-full bg-base-100">
			<header className="relative isolate flex h-44 flex-col justify-end overflow-hidden bg-primary px-4 pt-4 pb-12">
				<img
					src={bgIncident}
					alt=""
					aria-hidden="true"
					className="absolute inset-0 -z-10 h-full w-full object-cover opacity-70 mix-blend-multiply"
				/>
				<h1 className="font-title text-2xl font-bold text-accent">
					Nouveau signalement
				</h1>
				<p className="mt-1 text-sm text-white/85">
					Vos voisins concernés seront alertés aussitôt.
				</p>
			</header>

			<div className="relative -mt-8 px-4 pb-6">
				<section className="flex flex-col items-center rounded-3xl bg-base-300 px-6 py-10 text-center">
					<span className="flex h-20 w-20 items-center justify-center rounded-full bg-warning ring-8 ring-warning/20">
						<Icon
							name="envelope"
							className="block h-9 w-9 fill-primary"
							aria-hidden="true"
						/>
					</span>

					<h2 className="mt-6 font-title text-2xl font-bold text-primary">
						Vérifiez votre e-mail
					</h2>

					<p className="mt-3 max-w-xs text-sm leading-relaxed text-primary/70">
						Pour signaler un incident, vous devez d'abord confirmer
						votre adresse e-mail. Ouvrez le message que nous vous
						avons envoyé à l'inscription et cliquez sur le lien de
						confirmation.
					</p>

					{/* TODO US06 : bouton « Renvoyer l'e-mail de confirmation »
					    (appel API fourni par l'US06). */}
				</section>
			</div>
		</div>
	);
}
