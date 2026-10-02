import { apiFetch } from "@/services/apiClient";
import type { AuthUser } from "@/types/auth";

type LoginResponse = {
	token: string;
	user: {
		id: number;
		pseudo: string;
		email: string;
		emailVerified: boolean;
	};
};

export async function login(identifier: string, password: string) {
	const response = await apiFetch("/api/auth/login", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ identifier, password }),
	});

	if (!response.ok) {
		const data = (await response.json().catch(() => null)) as {
			message?: string;
		} | null;
		throw new Error(
			data?.message ??
				"Une erreur est survenue côté serveur. Réessayez dans un instant.",
		);
	}

	return response.json() as Promise<LoginResponse>;
}

export async function me() {
	const response = await apiFetch("/api/auth/me");
	if (!response.ok) return null;
	return response.json() as Promise<AuthUser>;
}
