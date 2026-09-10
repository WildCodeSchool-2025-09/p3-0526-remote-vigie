import type { Notification } from "../types/notification";
import { useNavigate } from "react-router";
import Icon from "./Icon/Icon";

const iconByType = {
  comment: "commentAltMiddle",
  incident_resolved: "checkCircle",
  incident: "fire",
  badge: "diamondExclamation",
  mention: "commentAltMiddle",
} as const;

const titleByType = {
  comment: "Nouveau commentaire sur votre signalement",
  incident_resolved: "Incident résolu",
  incident: "Nouvel incident près de chez vous",
  badge: "Vous avez obtenu un badge",
  mention: "Vous êtes cité dans un commentaire",
} as const;

const iconStyleByType = {
  comment: "bg-[var(--bg-tree)] text-[var(--tree)]",
  incident_resolved: "bg-[var(--bg-flood)] text-[var(--flood)]",
  incident: "bg-[var(--bg-fire)] text-[var(--fire)]",
  badge: "bg-[var(--bg-insect)] text-[var(--insect)]",
  mention: "bg-[var(--secondary-light)] text-[var(--secondary)]",
} as const;

function formatDate(date: string) {
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "Récemment";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function NotificationItem({
  notification,
  onRead,
}: {
  notification: Notification;
  onRead: (notification: Notification) => void;
}) {
  const navigate = useNavigate();
  const iconName = iconByType[notification.type];
  const title = titleByType[notification.type];

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
      className="card card-side h-fit min-h-0 self-start items-center gap-2 border-l-[0.35rem] border-l-transparent bg-base-100 p-3 shadow-sm sm:gap-3 sm:p-4"
    >
      <div
        className={`grid size-13 shrink-0 place-items-center rounded-2xl sm:size-15 ${iconStyleByType[notification.type]}`}
      >
        <Icon name={iconName} className="size-7 sm:size-8" aria-hidden="true" />
      </div>
      <div className="min-w-0 grow">
        <div className="flex items-center gap-2 text-sm text-secondary/55">
          <time dateTime={notification.created_at}>
            {formatDate(notification.created_at)}
          </time>
        </div>
        <h2 className="mt-1 font-title text-lg leading-tight sm:text-xl">
          {title}
        </h2>
        <p className="mt-1 truncate text-base text-secondary/70">
          {notification.incident_type ?? "Signalement"} · {notification.city}
        </p>
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
