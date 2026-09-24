import { useNavigate } from "react-router";
import type { IconName } from "../../../assets/icons";
import type { Notification } from "../../../types/notification";
import { formatDate } from "../../../utils/formatDate";
import Icon from "../../Icon/Icon";

type IncidentTypeConfig = {
	icon: IconName;
	style: string;
	border: string;
};

const incidentTypeConfig: Record<string, IncidentTypeConfig> = {
	fire: {
		icon: "fire",
		style: "bg-[var(--bg-fire)] text-[var(--fire)]",
		border: "border-l-[var(--fire)]",
	},
	insect: {
		icon: "insect",
		style: "bg-[var(--bg-insect)] text-[var(--insect)]",
		border: "border-l-[var(--insect)]",
	},
	flood: {
		icon: "flood",
		style: "bg-[var(--bg-flood)] text-[var(--flood)]",
		border: "border-l-[var(--flood)]",
	},
	hail: {
		icon: "hail",
		style: "bg-[var(--bg-hail)] text-[var(--hail)]",
		border: "border-l-[var(--hail)]",
	},
	glaze: {
		icon: "glaze",
		style: "bg-[var(--bg-glaze)] text-[var(--glaze)]",
		border: "border-l-[var(--glaze)]",
	},
	snow: {
		icon: "snow",
		style: "bg-[var(--bg-snow)] text-[var(--snow)]",
		border: "border-l-[var(--snow)]",
	},
	storm: {
		icon: "storm",
		style: "bg-[var(--bg-storm)] text-[var(--storm)]",
		border: "border-l-[var(--storm)]",
	},
	wild: {
		icon: "wild",
		style: "bg-[var(--bg-wild)] text-[var(--wild)]",
		border: "border-l-[var(--wild)]",
	},
	tornado: {
		icon: "tornado",
		style: "bg-[var(--bg-tornado)] text-[var(--tornado)]",
		border: "border-l-[var(--tornado)]",
	},
	rockfall: {
		icon: "rockfall",
		style: "bg-[var(--bg-rockfall)] text-[var(--rockfall)]",
		border: "border-l-[var(--rockfall)]",
	},
	animal: {
		icon: "animal",
		style: "bg-[var(--bg-animal)] text-[var(--animal)]",
		border: "border-l-[var(--animal)]",
	},
	tree: {
		icon: "tree",
		style: "bg-[var(--bg-tree)] text-[var(--tree)]",
		border: "border-l-[var(--tree)]",
	},
};

type NotificationTypeConfig = {
	title: string;
	icon?: IconName;
	iconStyle?: string;
	border?: string;
};

// icon/iconStyle/border absents pour "incident"/"incident_resolved" : ces deux
// types empruntent leur icône/couleur/bordure à incidentTypeConfig (voir plus bas).
const notificationTypeConfig: Record<string, NotificationTypeConfig> = {
	comment: {
		title: "Nouveau commentaire sur votre incident",
		icon: "comments",
		iconStyle: "bg-[var(--bg-warning)] fill-[var(--warning)]",
		border: "border-l-[var(--warning)]",
	},
	incident: {
		title: "Nouvel incident près de chez vous",
	},
	incident_resolved: {
		title: "Incident résolu",
	},
	badge: {
		title: "Vous avez obtenu un badge",
		icon: "diamondExclamation",
		iconStyle: "bg-[var(--bg-warning)] text-[var(--warning)]",
		border: "border-l-[var(--warning)]",
	},
	mention: {
		title: "Vous êtes cité dans un commentaire",
		icon: "comments",
		iconStyle: "bg-[var(--secondary-light)] text-[var(--secondary)]",
	},
};

const readBorder = "border-l-[var(--grey)]";
const readIconStyle = "bg-base-200 text-(--grey)";

const dangerLevelLabelByLevel: Record<number, string> = {
	1: "faible",
	2: "modéré",
	3: "important",
	4: "élevé",
	5: "critique",
};

function NotificationItem({
	notification,
	onRead,
}: {
	notification: Notification;
	onRead: (notification: Notification) => void;
}) {
	const navigate = useNavigate();

	const isIncidentType =
		notification.type === "incident" ||
		notification.type === "incident_resolved";
	const incidentType =
		incidentTypeConfig[notification.incident_type ?? "fire"] ??
		incidentTypeConfig.fire;
	const typeConfig = notificationTypeConfig[notification.type];

	const iconName = isIncidentType
		? incidentType.icon
		: (typeConfig?.icon ?? "notification");
	const typeIconStyle = isIncidentType
		? incidentType.style
		: (typeConfig?.iconStyle ?? notificationTypeConfig.mention.iconStyle);
	const title = typeConfig?.title ?? "Nouvelle notification";
	const isUnread = notification.is_read === false;
	const iconStyle = isUnread ? typeIconStyle : readIconStyle;
	const typeBorder = isIncidentType
		? incidentType.border
		: (typeConfig?.border ?? "");
	const borderColor = isUnread ? typeBorder : readBorder;

	const meta = [
		notification.city,
		notification.danger_level
			? `gravité ${notification.danger_level}`
			: null,
		notification.danger_level
			? dangerLevelLabelByLevel[notification.danger_level]
			: null,
	]
		.filter(Boolean)
		.join(" · ");

	const handleClick = () => {
		onRead(notification);

		if (notification.type === "badge") {
			navigate("/profile");
			return;
		}

		navigate(`/incident/${notification.incident_id}`);
	};

	return (
		<button
			type="button"
			onClick={handleClick}
			className={`flex items-center gap-3 rounded-2xl border border-l-8 border-primary/10 bg-base-300 p-3 ${borderColor}`}
		>
			<div
				className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${iconStyle}`}
			>
				<Icon name={iconName} className="h-7 w-7" aria-hidden="true" />
				{notification.type === "incident_resolved" && (
					<Icon
						name="checkCircle"
						className="absolute -right-1 -top-1 size-4 rounded-full bg-base-300 text-(--error) sm:size-5"
						aria-hidden="true"
					/>
				)}
			</div>

			<div className="min-w-0 flex-1">
				<div className="flex flex-wrap items-center gap-1.5">
					{isUnread ? (
						<span className="rounded-full bg-(--error)/15 px-2 py-0.5 text-xs font-bold text-(--error)">
							Non lue
						</span>
					) : (
						<span className="rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-bold text-secondary/60">
							Lue
						</span>
					)}
				</div>
				<h2 className="mt-1.5 font-title text-left text-lg font-bold text-primary line-clamp-2 leading-6">
					{title}
				</h2>
				<p className="mt-1 text-left text-xs text-primary/50">
					{meta} · {formatDate(notification.created_at)}
				</p>
			</div>

			<Icon
				name="angleSmallRight"
				className="h-4 w-4 shrink-0 fill-primary/30"
				aria-hidden="true"
			/>
		</button>
	);
}

export default NotificationItem;
