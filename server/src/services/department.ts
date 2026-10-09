// Outre-mer : 3 chiffres (971…) ; Corse : 2A/2B déjà inclus dans le code INSEE.
export default function departmentFromInsee(inseeCode: string): string {
	return inseeCode.startsWith("97")
		? inseeCode.slice(0, 3)
		: inseeCode.slice(0, 2);
}
