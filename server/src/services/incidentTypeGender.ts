// Miroir du genre grammatical déjà codé en dur dans TYPE_PHRASING
// (client/src/components/Form/DuplicateWarning/DuplicateWarning.tsx) —
// pas de partage de code entre client et server.
const FEMININE_TYPE_CODES = new Set([
	"tornado",
	"flood",
	"storm",
	"hail",
	"tree",
	"snow",
]);

export default function isFeminine(code: string): boolean {
	return FEMININE_TYPE_CODES.has(code);
}
