import { useNavigate } from "react-router";
import type { Notification } from "../types/notification";
import Icon from "./Icon/Icon";

const iconByType = {
  comment: "commentAltMiddle",
  incident_resolved: "checkCircle",
  incident: "fire",
  badge: "diamondExclamation",
  mention: "commentAltMiddle",
} as const;

const incidentIconByType = {
  fire: "fire",
  insect: "insect",
  flood: "flood",
  hail: "hail",
  glaze: "glaze",
  snow: "snow",
  storm: "storm",
  wild: "wild",
  tornado: "tornado",
  rockfall: "rockfall",
  animal: "animal",
  tree: "tree",
} as const;

const titleByType = {
  comment: "Nouveau commentaire sur votre incident",
  incident_resolved: "Incident résolu",
  incident: "Nouvel incident près de chez vous",
  badge: "Vous avez obtenu un badge",
  mention: "Vous êtes cité dans un commentaire",
} as const;

const iconStyleByType = {
  comment: "bg-[var(--bg-tree)] text-[black]",
  badge: "bg-[var(--bg-insect)] text-[var(--insect)]",
  mention: "bg-[var(--secondary-light)] text-[var(--secondary)]",
} as const;

const incidentStyleByType = {
  fire: "bg-[var(--bg-fire)] text-[var(--fire)]",
  insect: "bg-[var(--bg-insect)] text-[var(--insect)]",
  flood: "bg-[var(--bg-flood)] text-[var(--flood)]",
  hail: "bg-[var(--bg-hail)] text-[var(--hail)]",
  glaze: "bg-[var(--bg-glaze)] text-[var(--glaze)]",
  snow: "bg-[var(--bg-snow)] text-[var(--snow)]",
  storm: "bg-[var(--bg-storm)] text-[var(--storm)]",
  wild: "bg-[var(--bg-wild)] text-[var(--wild)]",
  tornado: "bg-[var(--bg-tornado)] text-[var(--tornado)]",
  rockfall: "bg-[var(--bg-rockfall)] text-[var(--rockfall)]",
  animal: "bg-[var(--bg-animal)] text-[var(--animal)]",
  tree: "bg-[var(--bg-tree)] text-[var(--tree)]",
} as const;

const incidentBorderByType = {
  fire: "border-l-[var(--fire)]",
  insect: "border-l-[var(--insect)]",
  flood: "border-l-[var(--flood)]",
  hail: "border-l-[var(--hail)]",
  glaze: "border-l-[var(--glaze)]",
  snow: "border-l-[var(--snow)]",
  storm: "border-l-[var(--storm)]",
  wild: "border-l-[var(--wild)]",
  tornado: "border-l-[var(--tornado)]",
  rockfall: "border-l-[var(--rockfall)]",
  animal: "border-l-[var(--animal)]",
  tree: "border-l-[var(--tree)]",
} as const;

const commentBorder = "border-l-[var(--primary-dark)]";
const badgeBorder = "border-l-[var(--insect)]";
const readBorder = "border-l-[var(--grey)]";

const incidentLabelByType = {
  fire: "Feu",
  insect: "Insectes",
  flood: "Inondation",
  hail: "Grêle",
  glaze: "Verglas",
  snow: "Neige",
  storm: "Tempête",
  wild: "Foudre",
  tornado: "Tornade",
  rockfall: "Éboulement",
  animal: "Animal sauvage",
  tree: "Chute d'arbre",
} as const;

const dangerLevelLabelByLevel: Record<number, string> = {
  1: "faible",
  2: "modéré",
  3: "important",
  4: "élevé",
  5: "critique",
};

function formatDate(date: string) {
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "Récemment";
  const elapsedMinutes = Math.max(
    0,
    Math.floor((Date.now() - value.getTime()) / 60000),
  );
  if (elapsedMinutes < 60) return `il y a ${elapsedMinutes || 1} min`;
  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `il y a ${elapsedHours} h`;
  const elapsedDays = Math.floor(elapsedHours / 24);
  return `il y a ${elapsedDays} j`;
}

function NotificationItem({
  notification,
  onRead,
}: {
  notification: Notification;
  onRead: (notification: Notification) => void;
}) {
  const navigate = useNavigate();
  const incidentType =
    notification.incident_type as keyof typeof incidentStyleByType;
  const iconName =
    notification.type === "incident"
      ? (incidentIconByType[
          notification.incident_type as keyof typeof incidentIconByType
        ] ?? "fire")
      : iconByType[notification.type];
  const iconStyle =
    notification.type === "incident" ||
    notification.type === "incident_resolved"
      ? (incidentStyleByType[incidentType] ?? incidentStyleByType.fire)
      : iconStyleByType[notification.type];
  const incidentBorder =
    incidentBorderByType[incidentType] ?? incidentBorderByType.fire;
  const incidentLabel = incidentLabelByType[incidentType];
  const label = notification.type === "badge" ? "Badge" : incidentLabel;
  const title = titleByType[notification.type];
  const isUnread = notification.is_read === false;
  const typeBorder =
    notification.type === "incident" ||
    notification.type === "incident_resolved"
      ? incidentBorder
      : notification.type === "comment"
        ? commentBorder
        : notification.type === "badge"
          ? badgeBorder
          : "";
  const borderColor = isUnread ? typeBorder : readBorder;
  const meta = [
    notification.city,
    notification.danger_level ? `gravité ${notification.danger_level}` : null,
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
      className={`flex items-center gap-3 h-26 rounded-2xl border border-l-8 border-primary/10 bg-base-300 p-3 ${borderColor}`}
    >
      <div className="flex shrink-0 flex-col items-center gap-1">
        <div
          className={`grid size-13 place-items-center rounded-2xl sm:size-15 ${iconStyle}`}
        >
          <Icon
            name={iconName}
            className="size-7 sm:size-8"
            aria-hidden="true"
          />
        </div>
        {label && (
          <span className="text-center text-sm font-bold leading-tight">
            {label}
          </span>
        )}
      </div>
      <div className="min-w-0 grow">
        <div className="flex items-center gap-2 text-sm text-secondary/55">
          {isUnread ? (
            <span className="rounded-full bg-(--error)/15 px-2 py-0.5 text-xs font-bold text-(--error)">
              Non lue
            </span>
          ) : (
            <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-bold text-secondary/60">
              Lue
            </span>
          )}
          <time dateTime={notification.created_at}>
            {formatDate(notification.created_at)}
          </time>
        </div>
        <h2 className="font-title text-lg font-bold text-primary line-clamp-1">
          {notification.type === "incident"
            ? (notification.incident_title ?? title)
            : title}
        </h2>
        <p className="mt-1 truncate text-sm text-secondary/60">{meta}</p>
      </div>
      <Icon
        name="angleSmallRight"
        className="size-6 shrink-0 text-secondary/45"
        aria-hidden="true"
      />
    </button>
  );
}

export default NotificationItem;
