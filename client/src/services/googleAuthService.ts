import { apiFetch } from "@/services/apiClient";
import type { GoogleSignupPayload, GoogleSignupResult } from "@/types/oauth";
import type { RegisterFieldError } from "@/types/register";

// Finalise une inscription commencée avec Google (US22).
export async function googleSignup(
	payload: GoogleSignupPayload,
): Promise<GoogleSignupResult> {
	try {
		const res = await apiFetch("/api/auth/google/signup", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});
		const body = (await res.json().catch(() => ({}))) as {
			token?: string;
			error?: string;
			message?: string;
			errors?: RegisterFieldError;
		};

		if (res.ok && body.token) {
			return { status: "ok", token: body.token };
		}
		if (res.status === 401) {
			return {
				status: "expired",
				message:
					body.message ?? "Votre inscription avec Google a expiré.",
			};
		}
		if (res.status === 409) {
			const field =
				body.error === "pseudo_already_used"
					? "pseudo"
					: body.error === "email_already_used"
						? "email"
						: null;
			return { status: "conflict", field, message: body.message ?? "" };
		}
		if (res.status === 400 || res.status === 503) {
			return {
				status: "invalid",
				errors: body.errors ?? { address: body.message },
			};
		}
		return { status: "error" };
	} catch {
		return { status: "error" };
	}
}
