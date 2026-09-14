import { type IconName, icons } from "@/assets/icons";
import Icon from "@/components/Icon/Icon";
import type {
	IncidentAuthor,
	IncidentDangerLevel,
	IncidentStatus,
	IncidentType,
} from "@/types/incidentDetails";
import { formatDateTime } from "@/utils/formatDate";

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
	return `le ${formatDateTime(iso)}`;
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
				<h2 className="font-title text-xl font-bold text-primary leading-none">
					Incident <span>{dangerLevel.label.toLowerCase()}</span>
				</h2>

				{status === "resolved" ? (
					<div className="badge badge-md shrink-0 gap-1.5 border-0 bg-(--bg-success) font-bold text-success">
						<Icon
							name="check"
							className="h-3 w-3 fill-success stroke-1 stroke-success"
							aria-hidden="true"
						/>
						Résolu
					</div>
				) : (
					<div className="badge badge-accent badge-md shrink-0 gap-1.5 border-0 font-bold leading-none">
						<span
							className="relative flex size-2"
							aria-hidden="true"
						>
							<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
							<span className="size-2 rounded-full bg-primary" />
						</span>
						En cours
					</div>
				)}
			</div>

			<ul className="flex flex-wrap items-center gap-2">
				{types.map((type) => {
					const iconName =
						type.icon in icons ? (type.icon as IconName) : null;

					return (
						<li
							key={type.code}
							className="badge badge-lg gap-1.5 rounded-(--radius-box) border-0 font-bold text-primary"
							style={{
								backgroundColor: `var(--bg-${type.code})`,
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
