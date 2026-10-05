import type { RegisterPayload } from "@/services/userService";
import type { RegisterFieldError } from "@/types/register";

// Envoyé à POST /api/auth/google/signup. Pas d'e-mail : le serveur le lit dans
// le jeton signé, ce qui empêche de le modifier.
export type GoogleSignupPayload = {
	pendingToken: string;
	pseudo: string;
	cguAccepted: boolean;
	address: RegisterPayload["address"];
};

export type GoogleSignupResult =
	| { status: "ok"; token: string }
	| { status: "invalid"; errors: RegisterFieldError }
	| { status: "conflict"; field: "email" | "pseudo" | null; message: string }
	| { status: "expired"; message: string }
	| { status: "error" };
