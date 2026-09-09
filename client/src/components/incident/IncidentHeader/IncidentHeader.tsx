import { type IconName, icons } from "@/assets/icons";
import Icon from "@/components/Icon/Icon";
import type {
	IncidentAuthor,
	IncidentDangerLevel,
	IncidentStatus,
	IncidentType,
} from "@/types/incidentDetails";

type Props = {
	types: IncidentType[];
	dangerLevel: IncidentDangerLevel;
	status: IncidentStatus;
	createdAt: string;
	author: IncidentAuthor;
};

// "Signalé aujourd'hui à 14:12" / "hier à …" / "le 3 septembre à …"
function formatReportedAt(iso: string) {
	const date = new Date(iso);
	const time = date.toLocaleTimeString("fr-FR", {
		hour: "2-digit",
		minute: "2-digit",
	});

	const today = new Date();
	const yesterday = new Date(today);
	yesterday.setDate(today.getDate() - 1);

	if (date.toDateString() === today.toDateString()) {
		return `aujourd'hui à ${time}`;
	}
	if (date.toDateString() === yesterday.toDateString()) {
		return `hier à ${time}`;
	}
	return `le ${date.toLocaleDateString("fr-FR", {
		day: "numeric",
		month: "long",
	})} à ${time}`;
}

export default function IncidentHeader({
	types,
	dangerLevel,
	status,
	createdAt,
	author,
}: Props) {
	return (
		<header className="flex flex-col gap-3">
			<div className="flex items-start justify-between gap-2">
				{/* Gravité : libellé + couleur issus de la base */}
				<h2 className="font-title text-xl font-bold text-primary">
					Incident <span>{dangerLevel.label.toLowerCase()}</span>
				</h2>

				{/* Statut — chips du design system (voir /help/components, famille Autres).
				    Toujours un texte, dot/icône en renfort (jamais la couleur seule). */}
				{status === "resolved" ? (
					<div className="badge badge-sm shrink-0 gap-1.5 border-0 bg-(--bg-success) font-bold text-success">
						<Icon
							name="check"
							className="h-3 w-3 fill-success"
							aria-hidden="true"
						/>
						Résolu
					</div>
				) : (
					<div className="badge badge-accent badge-sm shrink-0 gap-1.5 border-0 font-bold">
						<span
							className="h-1.5 w-1.5 rounded-full bg-primary"
							aria-hidden="true"
						/>
						En cours
					</div>
				)}
			</div>

			{/* Types — chip « Chip · type » du design system : badge + fond bg-{code}
			    + texte {code}, icône dédiée (couleurs déjà dans le SVG). */}
			<ul className="flex flex-wrap items-center gap-2">
				{types.map((type) => {
					const iconName =
						type.icon in icons ? (type.icon as IconName) : null;

					return (
						<li
							key={type.code}
							className="badge badge-xl gap-1.5 rounded-(--radius-box) border-0 font-bold"
							style={{
								backgroundColor: `var(--bg-${type.code})`,
								color: `var(--${type.code})`,
							}}
						>
							{iconName && (
								<Icon
									name={iconName}
									className="h-3.5 w-3.5"
									aria-hidden="true"
								/>
							)}
							{type.label}
						</li>
					);
				})}
			</ul>

			<div className="border-t border-primary/10 pt-3 text-sm text-primary/60">
				<p>Signalé {formatReportedAt(createdAt)}</p>
				<p>
					Par{" "}
					<strong className="text-primary">{author.pseudo}</strong>
				</p>
			</div>
		</header>
	);
}
