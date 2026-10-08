import { apiFetch } from "@/services/apiClient";
import { normalizeUser } from "@/services/authActions";
import type { AuthUser } from "@/types/auth";
import type { RegisterFieldError } from "@/types/register";

export type RegisterPayload = {
	pseudo: string;
	email: string;
	password: string;
	cguAccepted: boolean;
	address: {
		city: string;
		postalCode: string;
		inseeCode?: string;
		latitude?: number;
		longitude?: number;
		streetLine?: string;
		isApproximate?: boolean;
	};
};

type RegisterResult =
	| { status: "ok"; id: number }
	| { status: "invalid"; errors: RegisterFieldError }
	| { status: "conflict"; field: "email" | "pseudo" | null; message: string }
	| { status: "tooManyRequests"; message: string }
	| { status: "error" };

export async function register(
	payload: RegisterPayload,
): Promise<RegisterResult> {
	try {
		const res = await apiFetch("/api/users", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});

		if (res.status === 400) {
			const body = (await res.json()) as {
				error: string;
				message?: string;
				errors?: RegisterFieldError;
			};
			if (body.error === "invalid_address") {
				return {
					status: "invalid",
					errors: { address: body.message },
				};
			}
			return { status: "invalid", errors: body.errors ?? {} };
		}

		if (res.status === 409) {
			const body = (await res.json()) as {
				error: string;
				message: string;
			};
			let field: "email" | "pseudo" | null = null;
			if (body.error === "email_already_used") field = "email";
			else if (body.error === "pseudo_already_used") field = "pseudo";

			return { status: "conflict", field, message: body.message };
		}

		if (res.status === 429) {
			const body = (await res.json()) as { message: string };
			return { status: "tooManyRequests", message: body.message };
		}

		if (res.status === 503) {
			const body = (await res.json()) as { message?: string };
			return {
				status: "invalid",
				errors: {
					address:
						body.message ??
						"Le service d'adresse est momentanément indisponible.",
				},
			};
		}

		if (!res.ok) return { status: "error" };

		const body = (await res.json()) as { id: number };
		return { status: "ok", id: body.id };
	} catch {
		return { status: "error" };
	}
}

type VerifyEmailResult =
	| { status: "success"; message: string }
	| { status: "expired"; message: string }
	| { status: "error"; message: string };

export async function verifyEmail(token: string): Promise<VerifyEmailResult> {
	try {
		const res = await apiFetch("/api/users/verify-email", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ token }),
		});
		const body = (await res.json()) as { message?: string };

		if (res.status === 200) {
			return {
				status: "success",
				message:
					body.message ?? "Votre adresse e-mail a bien été vérifiée.",
			};
		}

		if (res.status === 410) {
			return {
				status: "expired",
				message: body.message ?? "Ce lien de vérification a expiré.",
			};
		}

		return {
			status: "error",
			message: body.message ?? "Ce lien de vérification est invalide.",
		};
	} catch {
		return {
			status: "error",
			message: "Une erreur est survenue. Veuillez réessayer plus tard.",
		};
	}
}

type ResendVerificationResult =
	| { status: "ok"; message: string }
	| { status: "tooManyRequests"; message: string }
	| { status: "error" };

export async function resendVerification(
	email: string,
): Promise<ResendVerificationResult> {
	try {
		const res = await apiFetch("/api/users/resend-verification", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email }),
		});
		const body = (await res.json()) as { message?: string };

		if (res.status === 429) {
			return {
				status: "tooManyRequests",
				message:
					body.message ?? "Trop de demandes. Réessayez plus tard.",
			};
		}

		if (!res.ok) return { status: "error" };

		return { status: "ok", message: body.message ?? "" };
	} catch {
		return { status: "error" };
	}
}

type UpdatePseudoResult =
	| { status: "ok"; user: AuthUser }
	| { status: "invalid"; message: string }
	| { status: "conflict"; message: string }
	| { status: "error" };

export async function updatePseudo(
	pseudo: string,
): Promise<UpdatePseudoResult> {
	try {
		const res = await apiFetch("/api/users/me/pseudo", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ pseudo }),
		});

		if (res.status === 400 || res.status === 409) {
			const body = (await res.json()) as { message: string };
			return {
				status: res.status === 400 ? "invalid" : "conflict",
				message: body.message,
			};
		}

		if (!res.ok) return { status: "error" };

		return {
			status: "ok",
			user: normalizeUser((await res.json()) as AuthUser),
		};
	} catch {
		return { status: "error" };
	}
}

type DeleteAccountResult =
	| { status: "ok" }
	| { status: "invalid"; message: string }
	| { status: "networkError" }
	| { status: "error" };

// Confirmation exigée avant toute suppression : le mot de passe, ou le pseudo
// pour un compte sans mot de passe (inscription Google).
export type DeleteAccountConfirmation =
	| { password: string }
	| { pseudo: string };

export async function deleteAccount(
	confirmation: DeleteAccountConfirmation,
): Promise<DeleteAccountResult> {
	try {
		const res = await apiFetch("/api/users/me", {
			method: "DELETE",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(confirmation),
		});

		if (res.status === 400 || res.status === 403) {
			const body = (await res.json()) as { message: string };
			return { status: "invalid", message: body.message };
		}

		if (!res.ok) return { status: "error" };

		return { status: "ok" };
	} catch {
		// Le serveur a pu valider la suppression avant la coupure : issue incertaine
		return { status: "networkError" };
	}
}
