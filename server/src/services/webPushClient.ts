import crypto from "node:crypto";
import webpush from "web-push";

// web-push does not check that the public key matches the private key
function isMatchingPair(publicKey: string, privateKey: string): boolean {
	const ecdh = crypto.createECDH("prime256v1");
	ecdh.setPrivateKey(Buffer.from(privateKey, "base64url"));
	return ecdh.getPublicKey().toString("base64url") === publicKey;
}

// Configured lazily; returns null (push disabled) rather than crashing the server
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
