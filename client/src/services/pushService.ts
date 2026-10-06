import { apiFetch } from "@/services/apiClient";

// Single entry point to the browser push APIs

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

// iOS only supports push for sites added to the home screen (16.4+)
function isIosDevice(): boolean {
	if (typeof navigator === "undefined") return false;
	const ua = navigator.userAgent;
	return (
		/iPhone|iPad|iPod/.test(ua) ||
		(ua.includes("Macintosh") && navigator.maxTouchPoints > 1)
	);
}

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

function getIosVersion(): [number, number] | null {
	const match = /(?:iPhone|iPad|iPod).*? OS (\d+)[_.](\d+)/.exec(
		navigator.userAgent,
	);
	return match ? [Number(match[1]), Number(match[2])] : null;
}

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

async function subscribe(): Promise<PushPermission> {
	if (!isPushSupported()) return "unsupported";

	const permission = await Notification.requestPermission();
	if (permission !== "granted") return permission;

	const publicKey = urlBase64ToBytes(await fetchPublicKey());
	const registration = await navigator.serviceWorker.ready;

	let subscription = await registration.pushManager.getSubscription();

	// An old subscription made with other VAPID keys would be rejected: replace it
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

// Server first: if it fails we stay subscribed and the user can retry
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
