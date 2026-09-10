import NotificationItem from "../../components/NotificationItem";
import { useNotificationCenter } from "../../contexts/Notification/useNotificationCenter";

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
    <main className="min-h-full bg-(--bg-dark) text-primary">
      <header className="relative isolate flex h-44 flex-col justify-end overflow-hidden bg-primary px-4 pt-4 pb-12">
        <img
          src="/src/assets/images/background-incident.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-70 mix-blend-multiply"
        />
        <h1 className="font-title text-2xl font-bold text-accent">
          Notifications
        </h1>
        <div className="absolute inset-0 -z-10 bg-primary/80" />
        <span className="mt-1 self-end text-sm text-white/85">
          {notifications.length} au total
        </span>
      </header>

      <section
        className="mx-auto w-full max-w-4xl p-4 pb-8 sm:p-8"
        aria-live="polite"
      >
        {!isLoading && !error && notifications.length > 0 && (
          <div className="alert mb-5 bg-base-100 text-primary shadow-sm">
            <span className="text-2xl" aria-hidden="true">
              ✓
            </span>
            <span className="font-bold">
              {notifications.filter((item) => item.is_read === false).length}{" "}
              notifications non lues
            </span>
            <button
              className="btn btn-ghost btn-sm ml-auto underline"
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
          <div className="notification-state py-16 text-center">
            <div className="mx-auto mb-6 grid size-32 place-items-center rounded-full border-2 border-primary text-5xl text-primary">
              −
            </div>
            <h2 className="font-title text-3xl">Aucune notification</h2>
            <p className="mx-auto mt-3 max-w-lg text-lg text-secondary/70">
              Vous retrouverez ici les incidents signalés près de vos adresses,
              les réponses à vos signalements et vos badges.
            </p>
          </div>
        )}
        {!isLoading && !error && notifications.length > 0 && (
          <div className="grid content-start gap-3">
            {notifications.map((notification) => (
              <NotificationItem
                key={`${notification.type}-${notification.source_id}`}
                notification={notification}
                onRead={markOneAsRead}
              />
            ))}
          </div>
        )}
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
