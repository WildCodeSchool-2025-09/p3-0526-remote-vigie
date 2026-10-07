// Mêmes règles que isValidPseudo côté serveur (server/src/services/validateRegisterInput.ts).
export const PSEUDO_MAX_LENGTH = 30;

export default function getPseudoError(pseudo: string): string | null {
	const trimmed = pseudo.trim();

	if (trimmed === "") return "Vous devez renseigner un pseudo";
	if (trimmed.includes("@")) return "Votre pseudo ne peut pas contenir de @";
	if (trimmed.length > PSEUDO_MAX_LENGTH) {
		return `Votre pseudo ne peut pas dépasser ${PSEUDO_MAX_LENGTH} caractères`;
	}

	return null;
}
