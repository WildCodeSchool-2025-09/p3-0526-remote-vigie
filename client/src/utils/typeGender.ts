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
