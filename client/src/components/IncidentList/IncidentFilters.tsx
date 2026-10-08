// Même plafond que MAX_SEARCH_LENGTH côté serveur (parseListFilters.ts).
const SEARCH_MAX_LENGTH = 100;

type IncidentSearchFieldProps = {
	value: string;
	onChange: (value: string) => void;
	// Validation avec Entrée.
	onSubmit: () => void;
};

export function IncidentSearchField({
	value,
	onChange,
	onSubmit,
}: IncidentSearchFieldProps) {
	return (
		<search className="block">
			<form
				className="relative"
				onSubmit={(event) => {
					event.preventDefault();
					onSubmit();
				}}
			>
				<label htmlFor="incident-search" className="sr-only">
					Rechercher un incident
				</label>
				<svg
					aria-hidden="true"
					viewBox="0 0 24 24"
					className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 fill-none stroke-primary/60 stroke-2"
					strokeLinecap="round"
				>
					<circle cx="11" cy="11" r="7" />
					<path d="m20 20-3.5-3.5" />
				</svg>
				<input
					id="incident-search"
					type="search"
					enterKeyHint="search"
					value={value}
					onChange={(event) => onChange(event.target.value)}
					maxLength={SEARCH_MAX_LENGTH}
					autoComplete="off"
					placeholder="Titre, description, commune…"
					className="h-11 w-full rounded-2xl border-0 bg-white pr-3 pl-10 text-sm text-black text-ellipsis shadow placeholder:text-black/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
				/>
			</form>
		</search>
	);
}
