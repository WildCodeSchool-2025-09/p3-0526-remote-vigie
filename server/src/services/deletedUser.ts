// Nom affiché à la place du pseudo d'un compte supprimé (US18). Seul
// pseudo_normalized est unique : plusieurs comptes peuvent porter ce nom.
export const DELETED_USER_PSEUDO = "Anonyme";

// Vrai si le pseudo se confond avec celui d'un compte supprimé, sans tenir
// compte de la casse, des accents ni des espaces autour.
export function isDeletedUserPseudo(pseudo: string): boolean {
	const simplify = (value: string) =>
		value
			.trim()
			.normalize("NFD")
			.replace(/\p{Diacritic}/gu, "")
			.toLowerCase();

	return simplify(pseudo) === simplify(DELETED_USER_PSEUDO);
}
