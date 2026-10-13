import IosInstallSteps from "@/components/PushOptInBanner/IosInstallSteps";
import { usePushSettings } from "@/components/PushSettings/usePushSettings";

export default function PushSettings() {
	const { state, busy, error, toggle } = usePushSettings();

	if (state == null) return null;
	if (!state.needsInstall && state.permission === "unsupported") return null;

	const denied = state.permission === "denied";
	const blocked = denied && !state.subscribed;

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
								className="block text-sm text-primary/75"
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
							className="toggle shrink-0 text-primary/60 checked:text-success aria-disabled:opacity-30"
							checked={state.subscribed}
							// aria-disabled, not disabled: a disabled input drops keyboard focus
							aria-disabled={busy || blocked}
							aria-busy={busy}
							onChange={() => {
								if (!busy && !blocked) void toggle();
							}}
							aria-describedby={
								blocked
									? "push-settings-state push-settings-blocked"
									: "push-settings-state"
							}
						/>
					</label>

					{blocked && (
						<p
							id="push-settings-blocked"
							className="mt-3 rounded-2xl bg-(--bg-warning) p-3 text-sm text-primary"
						>
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
