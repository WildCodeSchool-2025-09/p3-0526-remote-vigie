import { useEffect, useRef } from "react";

import Icon from "@/components/Icon/Icon";
import IncidentCard from "@/components/IncidentCard/IncidentCard";
import IncidentSortMenu from "@/components/IncidentList/IncidentSortMenu";
import type { IncidentListItem, IncidentSort } from "@/types/incidentList";

type IncidentListProps = {
	incidents: IncidentListItem[];
	isLoading: boolean;
	hasError: boolean;
	onRetry: () => void;
	isTruncated: boolean;
	limit: number;
	// Recherche appliquée à la liste affichée (vide : aucune).
	search: string;
	includeResolved: boolean;
	sortBy: IncidentSort;
	onSortChange: (value: IncidentSort) => void;
	selectedIncidentId?: number | null;
	onSelectIncident?: (incident: IncidentListItem) => void;
};

function IncidentCardSkeleton() {
	return (
		<div
			aria-hidden="true"
			className="flex items-center gap-3 rounded-2xl border border-l-8 border-primary/10 bg-base-300 p-3"
		>
			<div className="skeleton h-14 w-14 shrink-0 rounded-xl" />
			<div className="flex min-w-0 flex-1 flex-col gap-2">
				<div className="skeleton h-4 w-2/3 rounded-full" />
				<div className="skeleton h-3 w-1/3 rounded-full" />
			</div>
		</div>
	);
}

// Complète « Seuls les N incidents … sont affichés ».
const TRUNCATION_ORDER: Record<IncidentSort, string> = {
	date: "les plus récents",
	date_asc: "les plus anciens",
	severity: "les plus graves",
	severity_asc: "les moins graves",
};

function buildCountLabel(
	count: number,
	includeResolved: boolean,
	search: string,
): string {
	const noun = count > 1 ? "incidents" : "incident";

	if (search !== "") {
		const found = count > 1 ? "trouvés" : "trouvé";
		return `${count} ${noun} ${found}`;
	}

	const scope = includeResolved ? "" : " en cours";
	return `${count} ${noun}${scope}`;
}

export default function IncidentList({
	incidents,
	isLoading,
	hasError,
	onRetry,
	isTruncated,
	limit,
	search,
	includeResolved,
	sortBy,
	onSortChange,
	selectedIncidentId = null,
	onSelectIncident,
}: IncidentListProps) {
	// Élément <li> de chaque incident, pour faire défiler jusqu'à l'incident sélectionné.
	const itemRefs = useRef(new Map<number, HTMLLIElement>());

	useEffect(() => {
		if (selectedIncidentId == null) return;

		const element = itemRefs.current.get(selectedIncidentId);
		element?.scrollIntoView({ behavior: "smooth", block: "nearest" });
	}, [selectedIncidentId]);

	const hasResults = !isLoading && !hasError && incidents.length > 0;
	const isEmpty = !isLoading && !hasError && incidents.length === 0;
	const emptyTitle =
		search !== ""
			? `Aucun résultat pour « ${search} »`
			: "Rien à signaler dans cette zone";
	const countLabel = buildCountLabel(
		incidents.length,
		includeResolved,
		search,
	);

	// Annonce vide pendant le chargement : seul le résultat final est lu.
	// La limite est dite ici : la phrase de troncature n'est pas dans la zone annoncée.
	let liveMessage = "";
	if (hasResults) {
		liveMessage = isTruncated
			? `${countLabel}, liste limitée à ${limit}`
			: countLabel;
	}
	if (isEmpty) liveMessage = emptyTitle;

	function renderBody() {
		if (isLoading) {
			return (
				<output aria-live="polite" className="flex flex-col gap-3">
					<span className="sr-only">Chargement des incidents…</span>
					{Array.from({ length: 5 }, (_, index) => (
						// biome-ignore lint/suspicious/noArrayIndexKey:"squelettes statiques, jamais réordonnés".
						<IncidentCardSkeleton key={index} />
					))}
				</output>
			);
		}

		if (hasError) {
			return (
				<div className="flex flex-1 flex-col items-center justify-start">
					<div
						role="alert"
						aria-live="assertive"
						className="flex w-full max-w-sm flex-col gap-4 rounded-3xl bg-(--bg-error) p-4"
					>
						<div className="flex items-start gap-3">
							<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-error">
								<Icon
									name="exclamation"
									className="h-3.5 w-3.5 fill-white"
									aria-hidden="true"
								/>
							</span>
							<div>
								<h2 className="font-title text-lg font-bold text-error">
									Impossible de charger les incidents
								</h2>
								<p className="mt-1 text-sm text-black">
									La connexion au serveur a échoué. Vos
									alertes ne sont pas affectées : elles
									arriveront normalement.
								</p>
							</div>
						</div>
						<button
							type="button"
							onClick={onRetry}
							className="btn btn-md rounded-full border-none bg-error px-5 font-bold text-white"
						>
							Réessayer
						</button>
					</div>
				</div>
			);
		}

		if (incidents.length === 0) {
			// Annoncé par la zone aria-live persistante, pas par ce bloc.
			return (
				<div className="flex flex-1 flex-col items-center justify-start">
					<div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-3xl bg-base-300 p-4 text-center">
						<span
							className={`flex h-16 w-16 items-center justify-center rounded-full ${
								search !== ""
									? "bg-(--bg-info)"
									: "bg-(--bg-success)"
							}`}
						>
							<Icon
								name={search !== "" ? "info" : "check"}
								className={`h-8 w-8 ${
									search !== ""
										? "fill-primary"
										: "fill-success"
								}`}
								aria-hidden="true"
							/>
						</span>
						<div>
							<h2 className="font-title text-lg font-bold text-primary">
								{emptyTitle}
							</h2>
							<p className="mt-2 text-sm text-black">
								{search !== ""
									? `Modifiez votre recherche${
											includeResolved
												? "."
												: " ou cochez « Inclure les incidents résolus »."
										}`
									: "Déplacez ou dézoomez la carte pour voir d'autres incidents. Vous serez alerté dès qu'un voisin signale quelque chose près d'une de vos adresses."}
							</p>
						</div>
					</div>
				</div>
			);
		}

		return (
			<div className="flex flex-col gap-3">
				<ul className="flex flex-col gap-3">
					{incidents.map((incident) => (
						<li
							key={incident.id}
							ref={(element) => {
								if (element) {
									itemRefs.current.set(incident.id, element);
								} else {
									itemRefs.current.delete(incident.id);
								}
							}}
						>
							<IncidentCard
								incident={incident}
								isSelected={incident.id === selectedIncidentId}
								onSelect={onSelectIncident}
							/>
						</li>
					))}
				</ul>

				{isTruncated && (
					<p className="text-center text-xs text-primary/50">
						Seuls les {limit} incidents {TRUNCATION_ORDER[sortBy]}{" "}
						sont affichés
						{search !== "" ? " : précisez votre recherche." : "."}
					</p>
				)}
			</div>
		);
	}

	return (
		<>
			{/* Reste montée pour que chaque changement de résultat soit annoncé. */}
			<output aria-live="polite" className="sr-only">
				{liveMessage}
			</output>
			{/* En-tête permanent : le tri garde le focus pendant le rechargement. */}
			<div className="flex items-center justify-between gap-3">
				<div className="min-w-0 flex-1">
					{hasResults && (
						<h2 className="font-title text-lg leading-6 font-bold text-primary">
							{countLabel}
						</h2>
					)}
					{isLoading && (
						<div
							aria-hidden="true"
							className="skeleton mx-auto mt-1 h-5 w-40 rounded-full"
						/>
					)}
				</div>
				<IncidentSortMenu value={sortBy} onChange={onSortChange} />
			</div>
			{renderBody()}
		</>
	);
}
