import { Link } from "react-router";

import type { IconName } from "@/assets/icons";
import Icon from "@/components/Icon/Icon";
import type { IncidentListItem } from "@/types/incidentList";
import { formatRelativeTime } from "@/utils/formatRelativeTime";

type IncidentCardProps = {
	incident: IncidentListItem;
};

const STATUS_LABEL: Record<IncidentListItem["status"], string> = {
	in_progress: "En cours",
	resolved: "Résolu",
};

export default function IncidentCard({ incident }: IncidentCardProps) {
	const { dangerLevel, type, status } = incident;

	const typeColorVar = type ? `var(--${type.code})` : "var(--grey)";
	const typeBgVar = type ? `var(--bg-${type.code})` : "var(--bg-dark)";
	const relativeTime = formatRelativeTime(incident.createdAt);

	const ariaLabel = `${incident.title} — ${type?.label ?? "Incident"}, ${dangerLevel.label}, ${incident.city}, ${relativeTime}`;

	return (
		<Link
			to={`/incident/${incident.id}`}
			aria-label={ariaLabel}
			className="flex items-center gap-3 rounded-2xl border border-l-8 border-primary/10 bg-base-300 p-3"
			style={{ borderLeftColor: typeColorVar }}
		>
			<div className="flex w-14 shrink-0 flex-col items-center gap-1">
				<div
					className="flex h-14 w-14 items-center justify-center rounded-xl"
					style={{ backgroundColor: typeBgVar }}
				>
					{type && (
						<Icon
							name={type.code as IconName}
							className="h-7 w-7"
							aria-hidden="true"
						/>
					)}
				</div>
				{type && (
					<span
						className="line-clamp-2 text-center text-xs font-bold"
						style={{ color: typeColorVar }}
					>
						{type.label}
					</span>
				)}
			</div>

			<div className="min-w-0 flex-1">
				<div className="flex flex-col items-start gap-1.5 min-[370px]:flex-row min-[370px]:items-center">
					<span
						className="badge badge-sm whitespace-nowrap border font-bold"
						style={{
							borderColor: `var(--level-${dangerLevel.weight})`,
							backgroundColor: `var(--bg-level-${dangerLevel.weight})`,
							color: `var(--level-${dangerLevel.weight})`,
						}}
					>
						Incident {dangerLevel.label.toLowerCase()}
					</span>
					<span className="badge badge-sm gap-1.5 whitespace-nowrap border-0 font-bold bg-(--primary-light) text-success">
						<span
							className="h-1.5 w-1.5 rounded-full bg-success"
							aria-hidden="true"
						/>
						{STATUS_LABEL[status]}
					</span>
				</div>
				<h2 className="mt-1.5 line-clamp-2 font-title text-lg font-bold text-primary">
					{incident.title}
				</h2>
				<p className="mt-1 text-xs text-primary/50">
					{incident.city} · {relativeTime}
				</p>
			</div>

			<Icon
				name="angleSmallRight"
				className="h-4 w-4 shrink-0 fill-primary/30"
				aria-hidden="true"
			/>
		</Link>
	);
}
