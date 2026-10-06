import IosInstallSteps from "@/components/PushOptInBanner/IosInstallSteps";
import { usePushSettings } from "@/components/PushSettings/usePushSettings";

// Réglage des notifications push de l'appareil courant (US21), dans le profil.
export default function PushSettings() {
	const { state, busy, error, toggle } = usePushSettings();

	// État inconnu, ou navigateur sans push : rien n'est proposé.
	if (state == null) return null;
	if (!state.needsInstall && state.permission === "unsupported") return null;

	const denied = state.permission === "denied";

	return (
		<section
			aria-labelledby="push-settings-title"
			className="border-b border-dashed border-primary/15 py-4"
		>
			<h2
				id="push-settings-title"
				className="text-xs font-bold uppercase tracking-widest text-primary/75"
			>
				Notifications
			</h2>

			{state.needsInstall ? (
				<IosInstallSteps />
			) : (
				<>
					<label className="mt-3 flex items-center justify-between gap-4">
						<span>
							<span className="block font-bold text-primary">
								Alertes sur cet appareil
							</span>
							<span
								id="push-settings-state"
								className="block text-sm text-primary/70"
							>
								{state.subscribed
									? "Activées : vous êtes alerté même quand Vigie est fermé."
									: "Désactivées sur cet appareil."}
							</span>
						</span>
						<input
							type="checkbox"
							role="switch"
							aria-checked={state.subscribed}
							className="toggle toggle-accent shrink-0"
							checked={state.subscribed}
							disabled={busy || (denied && !state.subscribed)}
							onChange={() => void toggle()}
							aria-describedby="push-settings-state"
						/>
					</label>

					{denied && !state.subscribed && (
						<p className="mt-3 rounded-2xl bg-(--bg-warning) p-3 text-sm text-primary">
							<strong>Les notifications sont bloquées</strong> par
							votre navigateur. Pour les rétablir, autorisez-les
							pour Vigie dans ses réglages (sur Chrome : le
							cadenas à gauche de l'adresse, puis Autorisations ;
							sur iPhone, application installée : Réglages, puis
							Notifications, puis Vigie), puis revenez ici.
						</p>
					)}
				</>
			)}

			{error && (
				<p
					role="alert"
					className="mt-2 text-xs font-semibold text-error"
				>
					{error}
				</p>
			)}
		</section>
	);
}
