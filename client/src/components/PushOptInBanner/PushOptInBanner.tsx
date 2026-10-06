import Icon from "@/components/Icon/Icon";
import IosInstallSteps from "@/components/PushOptInBanner/IosInstallSteps";
import type { PushOptInMode } from "@/components/PushOptInBanner/usePushOptIn";

type PushOptInBannerProps = {
	mode: PushOptInMode;
	accepting: boolean;
	error: string | null;
	onAccept: () => void;
	onDismiss: () => void;
};

// Encart d'invitation aux notifications push (US21). Il ne décide pas de son
// affichage : voir usePushOptIn, utilisé par les pages qui le posent.
export default function PushOptInBanner({
	mode,
	accepting,
	error,
	onAccept,
	onDismiss,
}: PushOptInBannerProps) {
	const isInstall = mode === "install";

	return (
		<section
			aria-labelledby="push-opt-in-title"
			className="flex flex-col gap-3 rounded-3xl bg-base-300 p-4"
		>
			<div className="flex items-start gap-3">
				<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--bg-success)">
					<Icon
						name="notification"
						className="h-5 w-5 fill-success"
						aria-hidden="true"
					/>
				</span>
				<div>
					<h2
						id="push-opt-in-title"
						className="font-title text-lg font-bold text-primary"
					>
						{isInstall
							? "Installez Vigie pour être alerté"
							: "Soyez alerté à temps"}
					</h2>
					{isInstall ? (
						<IosInstallSteps />
					) : (
						<p className="mt-1 text-sm text-primary/70">
							Recevez une notification sur cet appareil quand un
							incident survient près de chez vous, même si Vigie
							est fermé.
						</p>
					)}
				</div>
			</div>
			<div className="flex flex-wrap gap-2">
				{isInstall ? (
					<button
						type="button"
						onClick={onDismiss}
						className="btn btn-accent btn-sm rounded-full border-none px-5 font-bold"
					>
						J'ai compris
					</button>
				) : (
					<>
						<button
							type="button"
							onClick={onAccept}
							disabled={accepting}
							className="btn btn-accent btn-sm rounded-full border-none px-5 font-bold"
						>
							Activer les notifications
						</button>
						<button
							type="button"
							onClick={onDismiss}
							disabled={accepting}
							className="btn btn-sm rounded-full border-2 border-primary bg-transparent px-5 text-primary shadow-none hover:bg-primary/10 disabled:border-primary/20 disabled:text-primary/40"
						>
							Plus tard
						</button>
					</>
				)}
			</div>
			{error && (
				<p role="alert" className="text-xs font-semibold text-error">
					{error}
				</p>
			)}
		</section>
	);
}
