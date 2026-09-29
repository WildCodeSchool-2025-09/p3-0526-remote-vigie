import { apiFetch } from "@/services/apiClient";
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
	};
};

type RegisterResult =
	| { status: "ok"; id: number }
	| { status: "invalid"; errors: RegisterFieldError }
	| { status: "conflict"; field: "email" | "pseudo"; message: string }
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
			return {
				status: "conflict",
				field: body.error === "email_already_used" ? "email" : "pseudo",
				message: body.message,
			};
		}

		if (res.status === 429) {
			const body = (await res.json()) as { message: string };
			return { status: "tooManyRequests", message: body.message };
		}

		if (!res.ok) return { status: "error" };

		const body = (await res.json()) as { id: number };
		return { status: "ok", id: body.id };
	} catch {
		return { status: "error" };
	}
}
