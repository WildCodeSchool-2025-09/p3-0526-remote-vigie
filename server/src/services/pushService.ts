import pushSubscriptionRepository, {
	type PushSubscriptionTarget,
} from "../modules/pushSubscription/pushSubscriptionRepository";
import webPushClient from "./webPushClient";

export type PushPayload = {
	title: string;
	body: string;
	icon: string;
	url: string;
};

export type PushResult =
	| { endpoint: string; ok: true }
	| { endpoint: string; ok: false; statusCode: number | null };

// An alert is useless late: let the relay drop it after one hour
const TTL_SECONDS = 60 * 60;
const TIMEOUT_MS = 10_000;

type WebPush = NonNullable<ReturnType<typeof webPushClient.getWebPush>>;

// Never log the full endpoint or the keys, only the relay host
function relayName(endpoint: string): string {
	try {
		return new URL(endpoint).hostname;
	} catch {
		return "relais inconnu";
	}
}

// 404 and 410: the relay no longer knows this device (app removed, permission
// revoked). Other failures are temporary, so the subscription is kept.
const GONE_STATUS_CODES = [404, 410];

async function removeIfGone(endpoint: string, statusCode: number | null) {
	if (statusCode == null || !GONE_STATUS_CODES.includes(statusCode)) return;
	try {
		await pushSubscriptionRepository.deleteByEndpoint(endpoint);
	} catch {
		console.error("Push : suppression de l'abonnement impossible");
	}
}

async function sendToDevice(
	webpush: WebPush,
	target: PushSubscriptionTarget,
	body: string,
): Promise<PushResult> {
	try {
		await webpush.sendNotification(
			{
				endpoint: target.endpoint,
				keys: { p256dh: target.p256dh_key, auth: target.auth_key },
			},
			body,
			{ TTL: TTL_SECONDS, urgency: "high", timeout: TIMEOUT_MS },
		);
		return { endpoint: target.endpoint, ok: true };
	} catch (err) {
		const statusCode =
			typeof (err as { statusCode?: unknown }).statusCode === "number"
				? (err as { statusCode: number }).statusCode
				: null;
		console.error(
			`Push non envoyé (${relayName(target.endpoint)}, statut ${statusCode ?? "aucun"})`,
		);
		await removeIfGone(target.endpoint, statusCode);
		return { endpoint: target.endpoint, ok: false, statusCode };
	}
}

// Never throws: a push failure must not block notifications or e-mail
async function send(
	userId: number,
	payload: PushPayload,
): Promise<PushResult[]> {
	try {
		const webpush = webPushClient.getWebPush();
		if (webpush == null) return [];

		const targets = await pushSubscriptionRepository.findByUser(userId);
		if (targets.length === 0) return [];

		const body = JSON.stringify(payload);
		return await Promise.all(
			targets.map((target) => sendToDevice(webpush, target, body)),
		);
	} catch {
		console.error("Push non envoyé : erreur inattendue");
		return [];
	}
}

// Bounded concurrency: a dense area must not open hundreds of connections at once
const BATCH_SIZE = 10;

// Same payload for several users, each user once, in batches
async function sendToUsers(
	userIds: number[],
	payload: PushPayload,
): Promise<void> {
	const unique = [...new Set(userIds)];
	for (let i = 0; i < unique.length; i += BATCH_SIZE) {
		await Promise.all(
			unique
				.slice(i, i + BATCH_SIZE)
				.map((userId) => send(userId, payload)),
		);
	}
}

export default { send, sendToUsers };
