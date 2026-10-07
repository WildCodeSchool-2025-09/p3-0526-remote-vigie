import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import webPushClient from "../../services/webPushClient";
import pushSubscriptionRepository from "./pushSubscriptionRepository";

// Only BREAD here (Browse, Read, Edit, Add, Delete)

const MAX_ENDPOINT_LENGTH = 512;
const MAX_KEY_LENGTH = 255;
const MAX_USER_AGENT_LENGTH = 255;

// Only the known browser push services: the server will later call this URL, so
// an allowlist is the only reliable guard against SSRF (a text filter on the
// host misses "localhost." or a public name that resolves to a private address)
const PUSH_HOSTS = [
	"fcm.googleapis.com", // Chrome, Edge, Opera, Brave, Samsung Internet
	"updates.push.services.mozilla.com", // Firefox
	"web.push.apple.com", // Safari
];
const PUSH_HOST_SUFFIXES = [".notify.windows.com"]; // Windows push

function isPushServiceHost(host: string): boolean {
	return (
		PUSH_HOSTS.includes(host) ||
		PUSH_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix))
	);
}

function isAcceptableEndpoint(value: unknown): value is string {
	if (
		typeof value !== "string" ||
		value.length === 0 ||
		value.length > MAX_ENDPOINT_LENGTH
	) {
		return false;
	}

	let url: URL;
	try {
		url = new URL(value);
	} catch {
		return false;
	}

	return (
		url.protocol === "https:" &&
		url.username === "" &&
		url.password === "" &&
		url.port === "" &&
		isPushServiceHost(url.hostname)
	);
}

function isKey(value: unknown): value is string {
	return (
		typeof value === "string" &&
		value.length > 0 &&
		value.length <= MAX_KEY_LENGTH
	);
}

function getAuthenticatedUserId(req: Parameters<RequestHandler>[0]) {
	const sub = req.auth?.sub;
	if (sub == null) throw new Error("Missing authenticated user");
	return Number(sub);
}

const readPublicKey: RequestHandler = (_req, res) => {
	// Only when the whole configuration is valid: a key handed out while push is
	// disabled would show "on" with no alert ever sent
	const publicKey =
		webPushClient.getWebPush() && process.env.VAPID_PUBLIC_KEY;

	if (!publicKey) {
		res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
			error: "PUSH_NOT_CONFIGURED",
			message: "Les notifications push ne sont pas configurées.",
		});
		return;
	}

	res.json({ publicKey });
};

const add: RequestHandler = async (req, res, next) => {
	try {
		const { endpoint, keys } = req.body ?? {};

		if (
			!isAcceptableEndpoint(endpoint) ||
			!isKey(keys?.p256dh) ||
			!isKey(keys?.auth)
		) {
			res.status(StatusCodes.BAD_REQUEST).json({
				error: "invalid_subscription",
				message: "Abonnement push invalide.",
			});
			return;
		}

		const userAgent = req
			.get("user-agent")
			?.slice(0, MAX_USER_AGENT_LENGTH);

		await pushSubscriptionRepository.create({
			userId: getAuthenticatedUserId(req),
			endpoint,
			p256dhKey: keys.p256dh,
			authKey: keys.auth,
			userAgent: userAgent || null,
		});

		res.sendStatus(StatusCodes.CREATED);
	} catch (err) {
		next(err);
	}
};

const destroy: RequestHandler = async (req, res, next) => {
	try {
		const endpoint = req.body?.endpoint;

		if (typeof endpoint !== "string" || endpoint.length === 0) {
			res.status(StatusCodes.BAD_REQUEST).json({
				error: "invalid_subscription",
				message: "Adresse d'abonnement manquante.",
			});
			return;
		}

		const deleted =
			await pushSubscriptionRepository.deleteByUserAndEndpoint(
				getAuthenticatedUserId(req),
				endpoint,
			);

		if (!deleted) {
			res.status(StatusCodes.NOT_FOUND).json({
				error: "subscription_not_found",
				message: "Appareil introuvable.",
			});
			return;
		}

		res.sendStatus(StatusCodes.NO_CONTENT);
	} catch (err) {
		next(err);
	}
};

export default {
	readPublicKey,
	add,
	destroy,
};
