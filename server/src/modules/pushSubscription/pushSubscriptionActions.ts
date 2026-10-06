import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import pushSubscriptionRepository from "./pushSubscriptionRepository";

// Only BREAD here (Browse, Read, Edit, Add, Delete)

// Limites des colonnes de push_subscription.
const MAX_ENDPOINT_LENGTH = 512;
const MAX_KEY_LENGTH = 255;
const MAX_USER_AGENT_LENGTH = 255;

// Le serveur enverra plus tard une requête vers cette adresse : on n'accepte
// qu'une URL https vers un nom de domaine public, jamais une adresse IP ni un
// hôte local, pour qu'on ne puisse pas faire viser le réseau interne (SSRF).
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

	const host = url.hostname;
	const isIpAddress = host.startsWith("[") || /^[0-9.]+$/.test(host);
	const isLocalName =
		!host.includes(".") ||
		host === "localhost" ||
		host.endsWith(".localhost") ||
		host.endsWith(".local") ||
		host.endsWith(".internal");

	return (
		url.protocol === "https:" &&
		url.username === "" &&
		url.password === "" &&
		!isIpAddress &&
		!isLocalName
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

// Clé publique VAPID : le navigateur en a besoin pour s'abonner (US21).
// Elle n'est pas secrète, la route est donc publique.
const readPublicKey: RequestHandler = (_req, res) => {
	const publicKey = process.env.VAPID_PUBLIC_KEY;

	if (!publicKey) {
		res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
			error: "PUSH_NOT_CONFIGURED",
			message: "Les notifications push ne sont pas configurées.",
		});
		return;
	}

	res.json({ publicKey });
};

// Enregistre l'appareil courant. Le corps reprend la forme de l'abonnement du
// navigateur : { endpoint, keys: { p256dh, auth } }.
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

// Retire l'appareil courant, seulement s'il appartient à l'utilisateur connecté.
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
