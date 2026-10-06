import { apiFetch } from "@/services/apiClient";

// Seul point d'entrée du client vers le push du navigateur (US21) : les
// composants ne touchent jamais à `serviceWorker`, `PushManager` ni
// `Notification`.

// "unsupported" : le navigateur n'offre pas le push, rien ne doit être proposé.
// Sinon, la valeur de `Notification.permission` : "default" (pas encore
// demandé), "granted" ou "denied" (refusé dans les réglages du navigateur, on
// ne peut plus le redemander par code).
export type PushPermission = NotificationPermission | "unsupported";

function isPushSupported(): boolean {
	return (
		typeof navigator !== "undefined" &&
		"serviceWorker" in navigator &&
		typeof window !== "undefined" &&
		"PushManager" in window &&
		"Notification" in window
	);
}

function getPermission(): PushPermission {
	return isPushSupported() ? Notification.permission : "unsupported";
}

// Le navigateur veut la clé publique en octets, le serveur la donne en base64
// « url-safe » (- et _ à la place de + et /, sans remplissage).
function urlBase64ToBytes(base64Url: string): Uint8Array<ArrayBuffer> {
	const padding = "=".repeat((4 - (base64Url.length % 4)) % 4);
	const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/");
	const raw = atob(base64);
	const bytes = new Uint8Array(new ArrayBuffer(raw.length));
	for (let i = 0; i < raw.length; i++) {
		bytes[i] = raw.charCodeAt(i);
	}
	return bytes;
}

// Sur iOS, le push n'existe que pour un site ajouté à l'écran d'accueil, et à
// partir d'iOS 16.4. Tant qu'il ne l'est pas, Safari n'expose même pas
// PushManager : isPushSupported() répond non, et l'utilisateur ne saurait pas
// qu'une solution existe.
function isIosDevice(): boolean {
	if (typeof navigator === "undefined") return false;
	const ua = navigator.userAgent;
	// Depuis iPadOS 13, l'iPad se présente comme un Mac (avec un écran tactile).
	return (
		/iPhone|iPad|iPod/.test(ua) ||
		(ua.includes("Macintosh") && navigator.maxTouchPoints > 1)
	);
}

// Vigie lancé depuis l'écran d'accueil, sans l'interface du navigateur.
function isInstalledApp(): boolean {
	if (typeof navigator === "undefined") return false;
	const { standalone } = navigator as Navigator & { standalone?: boolean };
	return (
		standalone === true ||
		(typeof window !== "undefined" &&
			typeof window.matchMedia === "function" &&
			window.matchMedia("(display-mode: standalone)").matches)
	);
}

// Version d'iOS quand le navigateur la donne. L'iPad en mode « Mac » ne la
// donne pas : on renvoie null et on ne conclut rien.
function getIosVersion(): [number, number] | null {
	const match = /(?:iPhone|iPad|iPod).*? OS (\d+)[_.](\d+)/.exec(
		navigator.userAgent,
	);
	return match ? [Number(match[1]), Number(match[2])] : null;
}

// Appareil iOS où installer Vigie permettrait d'activer le push : pas encore
// installé, et pas trop ancien pour que l'installation serve à quelque chose.
function needsInstallToPush(): boolean {
	if (!isIosDevice() || isInstalledApp()) return false;
	const version = getIosVersion();
	if (version == null) return true;
	const [major, minor] = version;
	return major > 16 || (major === 16 && minor >= 4);
}

async function getCurrentSubscription(): Promise<PushSubscription | null> {
	if (!isPushSupported()) return null;
	const registration = await navigator.serviceWorker.ready;
	return registration.pushManager.getSubscription();
}

// Cet appareil a-t-il un abonnement actif ? (réglage du profil)
async function isSubscribed(): Promise<boolean> {
	return (await getCurrentSubscription()) != null;
}

async function fetchPublicKey(): Promise<string> {
	const response = await apiFetch("/api/push-subscriptions/public-key");
	if (!response.ok) {
		throw new Error("Notifications push indisponibles sur le serveur");
	}
	const { publicKey } = (await response.json()) as { publicKey: string };
	return publicKey;
}

function sameKey(existing: ArrayBuffer | null, expected: Uint8Array) {
	if (existing == null) return false;
	const current = new Uint8Array(existing);
	return (
		current.length === expected.length &&
		current.every((byte, i) => byte === expected[i])
	);
}

// Demande l'autorisation puis enregistre l'appareil. À n'appeler qu'après une
// action de l'utilisateur (jamais au chargement). Renvoie l'autorisation
// obtenue : l'abonnement n'est créé que si elle est "granted".
async function subscribe(): Promise<PushPermission> {
	if (!isPushSupported()) return "unsupported";

	const permission = await Notification.requestPermission();
	if (permission !== "granted") return permission;

	const publicKey = urlBase64ToBytes(await fetchPublicKey());
	const registration = await navigator.serviceWorker.ready;

	let subscription = await registration.pushManager.getSubscription();

	// Un abonnement créé avec une autre clé (clés régénérées) ne serait jamais
	// accepté par le relais : on le remplace.
	if (
		subscription != null &&
		!sameKey(subscription.options.applicationServerKey, publicKey)
	) {
		await subscription.unsubscribe();
		subscription = null;
	}

	subscription ??= await registration.pushManager.subscribe({
		userVisibleOnly: true,
		applicationServerKey: publicKey,
	});

	const response = await apiFetch("/api/push-subscriptions", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(subscription.toJSON()),
	});
	if (!response.ok) {
		throw new Error("Impossible d'enregistrer cet appareil");
	}

	return permission;
}

// Retire l'appareil courant. Le serveur d'abord : en cas d'échec réseau on reste
// abonné et l'utilisateur peut réessayer, au lieu de se retrouver désabonné
// dans le navigateur mais encore enregistré en base. Un 404 (appareil déjà
// inconnu du serveur) n'empêche pas de poursuivre.
async function unsubscribe(): Promise<void> {
	const subscription = await getCurrentSubscription();
	if (subscription == null) return;

	const response = await apiFetch("/api/push-subscriptions", {
		method: "DELETE",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ endpoint: subscription.endpoint }),
	});
	if (!response.ok && response.status !== 404) {
		throw new Error("Impossible de désactiver les notifications");
	}

	await subscription.unsubscribe();
}

export default {
	isPushSupported,
	needsInstallToPush,
	getPermission,
	isSubscribed,
	subscribe,
	unsubscribe,
};
