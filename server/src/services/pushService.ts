import pushSubscriptionRepository, {
	type PushSubscriptionTarget,
} from "../modules/pushSubscription/pushSubscriptionRepository";
import webPushClient from "./webPushClient";

// Contenu d'une notification push (US21), lu par le service worker pour
// afficher la notification et ouvrir la bonne page au clic.
export type PushPayload = {
	title: string;
	body: string;
	icon: string;
	url: string;
};

// Résultat pour un appareil. Le code de statut permet au nettoyage des
// abonnements morts (404, 410) de réagir sans retoucher l'envoi.
export type PushResult =
	| { endpoint: string; ok: true }
	| { endpoint: string; ok: false; statusCode: number | null };

// Une alerte de proximité n'a plus de sens passé un moment : le relais jette le
// message plutôt que de réveiller l'utilisateur pour un incident dépassé.
const TTL_SECONDS = 60 * 60;
// Un relais qui ne répond pas ne doit pas figer l'envoi.
const TIMEOUT_MS = 10_000;

type WebPush = NonNullable<ReturnType<typeof webPushClient.getWebPush>>;

// L'adresse d'un appareil donne le droit de lui écrire : dans les journaux, on
// ne garde que le nom du relais et le code de réponse, jamais l'adresse ni les
// clés.
function relayName(endpoint: string): string {
	try {
		return new URL(endpoint).hostname;
	} catch {
		return "relais inconnu";
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
		return { endpoint: target.endpoint, ok: false, statusCode };
	}
}

// Envoie la notification à tous les appareils enregistrés de l'utilisateur, en
// parallèle : un appareil en panne n'empêche pas les autres. Ne lève jamais
// d'erreur, pour qu'un échec du push n'empêche ni la notification ni l'e-mail.
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

export default { send };
