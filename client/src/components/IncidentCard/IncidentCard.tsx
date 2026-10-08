import { Link } from "react-router";

import type { IconName } from "@/assets/icons";
import Icon from "@/components/Icon/Icon";
import type { IncidentListItem } from "@/types/incidentList";
import { formatRelativeTime } from "@/utils/formatRelativeTime";

type IncidentCardProps = {
	incident: IncidentListItem;
	isSelected?: boolean;
	onSelect?: (incident: IncidentListItem) => void;
};

const STATUS_LABEL: Record<IncidentListItem["status"], string> = {
	in_progress: "En cours",
	resolved: "Résolu",
};

export default function IncidentCard({
	incident,
	isSelected = false,
	onSelect,
}: IncidentCardProps) {
	const { dangerLevel, type, status } = incident;

	const typeColorVar = type ? `var(--${type.code})` : "var(--grey)";
	const typeBgVar = type ? `var(--bg-${type.code})` : "var(--bg-dark)";
	const relativeTime = formatRelativeTime(incident.createdAt);
	const cityLabel = incident.city ?? "position non précisée";

	function handleActivate() {
		onSelect?.(incident);
	}

	return (
		<div
			className={`relative flex items-center gap-3 rounded-2xl border border-l-8 border-primary/10 bg-base-300 p-3 has-[button:focus-visible]:outline-2 has-[button:focus-visible]:outline-offset-2 has-[button:focus-visible]:outline-primary ${
				isSelected ? "ring-2 ring-accent ring-offset-2" : ""
			}`}
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
							style={{ color: typeColorVar }}
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
					{status === "in_progress" ? (
						<span className="badge badge-accent badge-sm gap-1.5 whitespace-nowrap border-0 font-bold">
							<span
								className="h-1.5 w-1.5 rounded-full bg-primary"
								aria-hidden="true"
							/>
							{STATUS_LABEL[status]}
						</span>
					) : (
						<span className="badge badge-sm gap-1.5 whitespace-nowrap border-0 font-bold bg-(--bg-success) text-success">
							<Icon
								name="check"
								className="h-3.5 w-3.5 fill-success"
								aria-hidden="true"
							/>
							{STATUS_LABEL[status]}
						</span>
					)}
				</div>
				<h2 className="mt-1.5 font-title text-lg font-bold text-primary">
					<button
						type="button"
						onClick={handleActivate}
						aria-current={isSelected ? "true" : undefined}
						className="line-clamp-2 cursor-pointer text-left focus:outline-none after:absolute after:inset-0 leading-6"
					>
						{incident.title}
					</button>
				</h2>
				<p className="mt-1 text-xs text-primary/50">
					{cityLabel} · {relativeTime}
				</p>
			</div>

			{isSelected ? (
				<Link
					to={`/incident/${incident.id}`}
					className="btn btn-accent btn-sm relative z-10 shrink-0 self-end rounded-full"
				>
					Voir le détail
				</Link>
			) : (
				<Icon
					name="angleSmallRight"
					className="h-4 w-4 shrink-0 fill-primary/30"
					aria-hidden="true"
				/>
			)}
		</div>
	);
}
