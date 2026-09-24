import { type IconName, icons } from "@/assets/icons";
import Icon from "@/components/Icon/Icon";
import type { IncidentType, NearbyIncident } from "@/types/incidentForm";
import { formatDistance } from "@/utils/distance";
import { formatRelativeTime } from "@/utils/formatRelativeTime";

type DuplicateWarningProps = {
	candidate: NearbyIncident;
	type: IncidentType | null;
	distanceMeters: number;
	onJoin: () => void;
	onIgnore: () => void;
};

const TYPE_PHRASING: Record<string, { subject: string; feminine: boolean }> = {
	tornado: { subject: "Une tornade", feminine: true },
	fire: { subject: "Un feu", feminine: false },
	flood: { subject: "Une inondation", feminine: true },
	storm: { subject: "Une tempête", feminine: true },
	rockfall: { subject: "Un éboulement", feminine: false },
	hail: { subject: "De la grêle", feminine: true },
	glaze: { subject: "Du verglas", feminine: false },
	wild: { subject: "Un animal sauvage", feminine: false },
	tree: { subject: "Une chute d'arbre", feminine: true },
	snow: { subject: "De la neige", feminine: true },
	insect: { subject: "Un nid d'insectes", feminine: false },
	animal: { subject: "Un animal perdu", feminine: false },
};

export default function DuplicateWarning({
	candidate,
	type,
	distanceMeters,
	onJoin,
	onIgnore,
}: DuplicateWarningProps) {
	const iconName: IconName =
		type && type.icon in icons ? (type.icon as IconName) : "marker";

	const phrasing = type ? TYPE_PHRASING[type.code] : null;

	const title = phrasing
		? `${phrasing.subject} a déjà été signalé${phrasing.feminine ? "e" : ""} près d'ici`
		: "Un signalement du même type existe déjà près d'ici";

	const backgroundColor = type
		? `var(--bg-${type.icon})`
		: "var(--bg-warning)";

	return (
		<section
			className="space-y-4 rounded-2xl p-4 animate-pop"
			style={{ backgroundColor }}
		>
			<div className="flex items-start gap-3">
				<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--accent-light)">
					<Icon
						name={iconName}
						className="h-4 w-4"
						aria-hidden="true"
					/>
				</span>
				<div className="min-w-0">
					<h2 className="font-title text-lg font-bold text-primary">
						{title}
					</h2>
					<p className="text-sm text-primary/50">
						{candidate.city && `${candidate.city} · `}
						{formatDistance(distanceMeters)} ·{" "}
						{formatRelativeTime(candidate.createdAt)}
					</p>
				</div>
			</div>
			<div className="grid grid-cols-2 gap-3">
				<button
					type="button"
					onClick={onJoin}
					className="btn rounded-full border-none"
					style={{
						backgroundColor: type?.color ?? "var(--warning)",
						color: backgroundColor,
					}}
				>
					Rejoindre
				</button>
				<button
					type="button"
					onClick={onIgnore}
					className="btn btn-outline rounded-full"
					style={{ borderColor: type?.color, color: type?.color }}
				>
					Ignorer
				</button>
			</div>
		</section>
	);
}
