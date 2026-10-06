import crypto from "node:crypto";
import webpush from "web-push";

// web-push accepte sans broncher une clé publique qui ne correspond pas à la
// clé privée : tous les envois seraient alors refusés par les relais, sans
// message clair. On vérifie donc la correspondance au démarrage du push.
function isMatchingPair(publicKey: string, privateKey: string): boolean {
	const ecdh = crypto.createECDH("prime256v1");
	ecdh.setPrivateKey(Buffer.from(privateKey, "base64url"));
	return ecdh.getPublicKey().toString("base64url") === publicKey;
}

// Bibliothèque web-push configurée avec les clés VAPID de Vigie (US21).
// Configuration paresseuse, au premier envoi : les variables d'environnement
// sont alors chargées. Si elle est absente ou invalide, le push est désactivé
// (renvoie null) sans empêcher le serveur de démarrer : le centre de
// notifications et l'e-mail ne dépendent pas du push.
let client: typeof webpush | null = null;
let attempted = false;

function getWebPush(): typeof webpush | null {
	if (attempted) return client;
	attempted = true;

	const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;

	if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !VAPID_SUBJECT) {
		console.warn(
			"Web Push désactivé : VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY et VAPID_SUBJECT sont requis.",
		);
		return null;
	}

	try {
		if (!isMatchingPair(VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)) {
			throw new Error(
				"La clé publique ne correspond pas à la clé privée.",
			);
		}
		webpush.setVapidDetails(
			VAPID_SUBJECT,
			VAPID_PUBLIC_KEY,
			VAPID_PRIVATE_KEY,
		);
		client = webpush;
	} catch (err) {
		console.error(
			"Web Push désactivé : configuration VAPID invalide.",
			err,
		);
	}

	return client;
}

export default { getWebPush };
