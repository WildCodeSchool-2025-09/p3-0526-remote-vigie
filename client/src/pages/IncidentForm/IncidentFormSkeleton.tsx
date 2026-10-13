function IncidentTypeCardSkeleton() {
	return (
		<div className="flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border border-(--primary-light) bg-base-300 p-3">
			<div className="skeleton h-14 w-14 rounded-full" />
			<div className="skeleton mt-2 h-3 w-12 rounded" />
		</div>
	);
}

export default function IncidentFormSkeleton() {
	const cards = Array.from({ length: 12 }, (_, i) => `type-skeleton-${i}`);

	return (
		<div
			className="relative -mt-8 space-y-4 px-4 pb-6"
			aria-busy="true"
			aria-label="Chargement des types de signalement"
		>
			<span className="sr-only">
				Chargement des types de signalement…
			</span>

			<div className="rounded-2xl bg-base-200 p-4" aria-hidden="true">
				<div className="flex items-center gap-2 pb-8">
					<span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-content">
						1
					</span>
					<h2 className="font-title text-lg font-bold text-primary">
						Que voulez-vous signaler ?
					</h2>
				</div>
				<div className="grid grid-cols-3 gap-x-3 gap-y-6">
					{cards.map((key) => (
						<IncidentTypeCardSkeleton key={key} />
					))}
				</div>
			</div>

			<div className="rounded-2xl bg-base-200 p-4" aria-hidden="true">
				<div className="flex items-center justify-between gap-2">
					<span className="flex items-center gap-2">
						<span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-content">
							2
						</span>
						<h2 className="font-title text-lg font-bold text-primary">
							Détails
						</h2>
					</span>
					<span className="text-neutral">Facultatif</span>
				</div>
			</div>
		</div>
	);
}
