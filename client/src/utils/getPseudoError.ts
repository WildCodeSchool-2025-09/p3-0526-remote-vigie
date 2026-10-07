// Mêmes règles que isValidPseudo côté serveur (server/src/services/validateRegisterInput.ts).
export const PSEUDO_MAX_LENGTH = 30;

// Même règle que isDeletedUserPseudo côté serveur (server/src/services/deletedUser.ts).
function isDeletedUserPseudo(pseudo: string): boolean {
	const simplify = (value: string) =>
		value
			.trim()
			.normalize("NFD")
			.replace(/\p{Diacritic}/gu, "")
			.toLowerCase();

	return simplify(pseudo) === simplify("Utilisateur supprimé");
}

export default function getPseudoError(pseudo: string): string | null {
	const trimmed = pseudo.trim();

	if (trimmed === "") return "Vous devez renseigner un pseudo";
	if (trimmed.includes("@")) return "Votre pseudo ne peut pas contenir de @";
	if (trimmed.length > PSEUDO_MAX_LENGTH) {
		return `Votre pseudo ne peut pas dépasser ${PSEUDO_MAX_LENGTH} caractères`;
	}

	// Réservé : ce nom s'affiche pour les comptes supprimés
	if (isDeletedUserPseudo(trimmed)) return "Ce pseudo n'est pas disponible";

	return null;
}
