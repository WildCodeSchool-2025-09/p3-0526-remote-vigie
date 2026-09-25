export function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
}

export function normalizePseudo(pseudo: string): string {
	return pseudo.trim().toLowerCase();
}
