import Icon from "../../components/Icon/Icon";
import NotificationItem from "../../components/NotificationItem";
import { useNotificationCenter } from "../../contexts/Notification/useNotificationCenter";
import type { Notification } from "../../types/notification";

function getDateGroupLabel(date: string) {
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "Plus tôt";

  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round(
    (startOfDay(new Date()) - startOfDay(value)) / 86_400_000,
  );

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  return value.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year:
      value.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}

function groupByDate(notifications: Notification[]) {
  const groups = new Map<string, Notification[]>();
  for (const notification of notifications) {
    const label = getDateGroupLabel(notification.created_at);
    const group = groups.get(label) ?? [];
    group.push(notification);
    groups.set(label, group);
  }
  return [...groups.entries()];
}

function NotificationCenter() {
  const {
    notifications,
    page,
    hasMore,
    isLoading,
    error,
    loadNotifications,
    markAllAsRead,
    markOneAsRead,
  } = useNotificationCenter();

  return (
    <main className="min-h-full bg-base-100">
      <header className="relative isolate flex h-36 flex-col justify-center overflow-hidden bg-primary px-4 pb-10">
        <img
          src="/src/assets/images/background-incident.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-70 mix-blend-multiply"
        />
        <div className="absolute inset-0 -z-10 bg-primary/80" />
        <h1 className="font-title text-2xl font-bold text-accent">
          Notifications
        </h1>
      </header>

      <section
        className="mx-auto w-full max-w-4xl px-4 pb-24 sm:px-8 sm:pb-28"
        aria-live="polite"
      >
        {!isLoading && !error && notifications.length > 0 && (
          <div className="-mt-8 relative mb-6 flex items-center justify-between gap-3 rounded-2xl bg-base-300 p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Icon
                name="notification"
                className="size-5 text-primary"
                aria-hidden="true"
              />
              <span className="font-title text-lg font-bold text-primary">
                {notifications.filter((item) => item.is_read === false).length}{" "}
                non lues sur {notifications.length}
              </span>
            </div>
            <button
              className="shrink-0 text-sm font-bold text-secondary underline underline-offset-2"
              type="button"
              onClick={() => void markAllAsRead()}
            >
              Tout marquer comme lu
            </button>
          </div>
        )}
        {isLoading && (
          <div className="notification-state py-16 text-center">
            <span className="loading loading-spinner loading-lg" />
            <p className="mt-4 font-bold">Chargement de vos notifications...</p>
          </div>
        )}
        {error && (
          <div
            className="notification-state rounded-2xl border-2 border-error bg-base-100 p-8 text-center"
            role="alert"
          >
            <div className="mx-auto mb-6 grid size-32 place-items-center rounded-full border-2 border-primary text-5xl text-primary">
              !
            </div>
            <h2 className="font-title text-3xl">
              Impossible d'afficher vos notifications
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-secondary/70">
              La connexion au serveur a échoué. Réessayez dans un instant.
            </p>
            <button
              className="btn btn-primary mt-6"
              type="button"
              onClick={() => void loadNotifications()}
            >
              Réessayer
            </button>
          </div>
        )}
        {!isLoading && !error && notifications.length === 0 && (
        <div className="flex flex-col gap-4 rounded-3xl bg-(--bg-error) p-4 relative -mt-8 space-y-4 px-4">
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-error">
              <Icon name="exclamation" className="h-3.5 w-3.5 fill-white" aria-hidden="true" />
            </span>
            <div>
            <h2 className="font-title text-lg font-bold text-error">
              Aucune notification
            </h2>
            <p className="mt-1 text-sm text-black">
              Vous retrouverez ici les incidents signalés près de vos adresses,
              les réponses à vos signalements et vos badges.
            </p>
          </div>
        </div>
            <button
              type="button"
              className="btn btn-accent btn-md w-full rounded-full border-none px-5 font-bold mt-3">
              Aller à l'accueil
            </button>
          </div>
        )}
        {!isLoading &&
          !error &&
          notifications.length > 0 &&
          groupByDate(notifications).map(([dateLabel, items]) => (
            <div key={dateLabel} className="mb-5">
              <h2 className="mb-2 text-xs font-bold tracking-wide text-secondary/50 uppercase">
                {dateLabel}
              </h2>
              <div className="grid content-start gap-3">
                {items.map((notification) => (
                  <NotificationItem
                    key={`${notification.type}-${notification.source_id}`}
                    notification={notification}
                    onRead={markOneAsRead}
                  />
                ))}
              </div>
            </div>
          ))}
        {hasMore && !isLoading && (
          <button
            className="btn btn-outline mt-5 w-full"
            type="button"
            onClick={() => void loadNotifications(page + 1)}
          >
            Charger plus
          </button>
        )}
      </section>
    </main>
  );
}

export default NotificationCenter;
