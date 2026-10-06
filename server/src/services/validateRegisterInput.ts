import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

export function isValidAddress(address: unknown): boolean {
	if (typeof address !== "object" || address === null) {
		return false;
	}

	const {
		city,
		postalCode,
		inseeCode,
		latitude,
		longitude,
		streetLine,
		isApproximate,
	} = address as {
		city: unknown;
		postalCode: unknown;
		inseeCode?: unknown;
		latitude?: unknown;
		longitude?: unknown;
		streetLine?: unknown;
		isApproximate?: unknown;
	};

	if (typeof city !== "string" || city.trim() === "" || city.length > 100) {
		return false;
	}

	if (typeof postalCode !== "string" || !/^\d{5}$/.test(postalCode)) {
		return false;
	}

	if (
		inseeCode !== undefined &&
		(typeof inseeCode !== "string" ||
			!/^(\d{5}|2[AB]\d{3})$/i.test(inseeCode))
	) {
		return false;
	}

	if (
		latitude !== undefined &&
		(typeof latitude !== "number" || latitude < -90 || latitude > 90)
	) {
		return false;
	}

	if (
		longitude !== undefined &&
		(typeof longitude !== "number" || longitude < -180 || longitude > 180)
	) {
		return false;
	}

	if (
		streetLine !== undefined &&
		(typeof streetLine !== "string" || streetLine.length > 255)
	) {
		return false;
	}

	if (isApproximate !== undefined && typeof isApproximate !== "boolean") {
		return false;
	}

	return true;
}

const validateRegisterInput: RequestHandler = (req, res, next) => {
	const body = req.body as {
		pseudo: unknown;
		email: unknown;
		password: unknown;
		cguAccepted: unknown;
		address: unknown;
	};

	const errors: Record<string, string> = {};

	if (
		typeof body.pseudo !== "string" ||
		body.pseudo.trim() === "" ||
		body.pseudo.includes("@") ||
		body.pseudo.length > 30
	) {
		errors.pseudo = "Veuillez renseigner un pseudo valide.";
	}

	if (
		typeof body.email !== "string" ||
		body.email.trim() === "" ||
		body.email.length > 255 ||
		!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)
	) {
		errors.email = "Veuillez renseigner une adresse e-mail valide.";
	}

	if (
		typeof body.password !== "string" ||
		body.password.trim() === "" ||
		body.password.length < 8 ||
		body.password.length > 128 ||
		!/[A-Z]/.test(body.password) ||
		!/[0-9]/.test(body.password) ||
		!/[^A-Za-z0-9]/.test(body.password)
	) {
		errors.password = "Veuillez renseigner un mot de passe valide.";
	}

	if (typeof body.cguAccepted !== "boolean" || body.cguAccepted === false) {
		errors.cgu = "Vous devez accepter les CGU.";
	}

	if (!isValidAddress(body.address)) {
		errors.address = "Veuillez renseigner une adresse valide.";
	}

	if (Object.keys(errors).length > 0) {
		res.status(StatusCodes.BAD_REQUEST).json({
			error: "invalid_input",
			errors,
		});
		return;
	}

	next();
};

export default validateRegisterInput;
