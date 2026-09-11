// Écran squelette affiché pendant le chargement de la fiche. Les blocs
// reprennent la forme des vraies sections (bandeau, en-tête, carte, actions)
// pour éviter tout saut de mise en page quand le contenu réel arrive.
export default function IncidentDetailsSkeleton() {
	return (
		<div
			className="INCIDENT-DETAILS-PAGE bg-base-100"
			aria-busy="true"
			aria-label="Chargement du signalement"
		>
			<span className="sr-only">Chargement du signalement…</span>

			{/* Bandeau */}

			<div className="relative mt-4 space-y-4 px-4 pb-6">
				{/* IncidentHeader */}
				<div className="flex flex-col gap-3 rounded-2xl bg-base-300 p-4">
					<div className="flex items-center justify-between gap-2">
						<div className="skeleton h-6 w-32" />
						<div className="skeleton h-6 w-20 rounded-full" />
					</div>
					<div className="flex gap-2">
						<div className="skeleton h-7 w-20 rounded-full" />
						<div className="skeleton h-7 w-24 rounded-full" />
					</div>
					<div className="flex flex-col gap-2 border-t border-primary/10 pt-3">
						<div className="skeleton h-3 w-40" />
						<div className="skeleton h-3 w-28" />
					</div>
				</div>

				{/* IncidentLocation */}
				<div className="flex flex-col gap-3">
					<div className="skeleton h-4 w-48" />
					<div className="skeleton h-56 w-full rounded-2xl" />
				</div>

				{/* IncidentContributions */}
				<div className="grid grid-cols-2 gap-3">
					<div className="skeleton h-16 w-full rounded-xl" />
					<div className="skeleton h-16 w-full rounded-xl" />
				</div>

				{/* IncidentContent */}
				<div className="flex flex-col gap-2">
					<div className="skeleton h-3 w-full" />
					<div className="skeleton h-3 w-5/6" />
					<div className="skeleton h-3 w-2/3" />
				</div>

				{/* SafetyInstructions */}
				<div className="skeleton h-20 w-full rounded-2xl" />

				{/* IncidentActions */}
				<div className="flex gap-3 border-t border-primary/10 pt-4">
					<div className="skeleton h-12 w-full rounded-full" />
					<div className="skeleton h-12 w-full rounded-full" />
				</div>
			</div>
		</div>
	);
}
