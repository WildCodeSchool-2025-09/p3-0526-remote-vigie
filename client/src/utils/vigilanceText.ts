import type { Phenomenon } from "@/types/vigilance";

// Les vigilances concernent la France : heures toujours affichées en heure de Paris.
const PARIS = "Europe/Paris";

const PHENOMENON_LABELS: Record<Phenomenon, string> = {
	wind: "vent violent",
	"rain-flood": "pluie-inondation",
	storms: "orages",
	floods: "crues",
	"snow-ice": "neige-verglas",
	"heat-wave": "canicule",
	"cold-wave": "grand froid",
	avalanches: "avalanches",
	"waves-submersion": "vagues-submersion",
};

// ["wind", "storms"] → "Vent violent et orages"
export function formatPhenomena(phenomena: Phenomenon[]): string {
	const labels = phenomena
		.filter((phenomenon) =>
			Object.prototype.hasOwnProperty.call(PHENOMENON_LABELS, phenomenon),
		)
		.map((phenomenon) => PHENOMENON_LABELS[phenomenon]);
	const text =
		labels.length > 1
			? `${labels.slice(0, -1).join(", ")} et ${labels[labels.length - 1]}`
			: (labels[0] ?? "");

	return text.charAt(0).toUpperCase() + text.slice(1);
}

// Morceaux d'une date en heure de Paris : { year: "2026", month: "10", day: "08", hour: "9", minute: "30" }
function parisParts(date: Date): Record<string, string> {
	const parts = new Intl.DateTimeFormat("fr-FR", {
		timeZone: PARIS,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "numeric",
		minute: "2-digit",
		hourCycle: "h23",
	}).formatToParts(date);

	return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

// "2026-10-08T07:30:00Z" → "9:30"
export function formatParisTime(iso: string): string {
	const { hour, minute } = parisParts(new Date(iso));
	return `${hour}:${minute}`;
}

// "6 h" ; "18 h 30"
function formatParisHour(date: Date): string {
	const { hour, minute } = parisParts(date);
	return minute === "00" ? `${hour} h` : `${hour} h ${minute}`;
}

// Jour à Paris au format "2026-10-08".
function parisDay(date: Date): string {
	const { year, month, day } = parisParts(date);
	return `${year}-${month}-${day}`;
}

function nextDay(day: string): string {
	const date = new Date(`${day}T12:00:00Z`);
	date.setUTCDate(date.getUTCDate() + 1);
	return date.toISOString().slice(0, 10);
}

// "jusqu'à 18 h", "jusqu'à minuit", "jusqu'à demain 6 h" ; null si déjà passée.
export function formatEndTime(
	iso: string,
	now: Date = new Date(),
): string | null {
	const end = new Date(iso);
	if (end <= now) return null;

	const hour = formatParisHour(end);
	const today = parisDay(now);
	const endDay = parisDay(end);

	if (endDay === today) return `jusqu'à ${hour}`;
	if (endDay === nextDay(today)) {
		return hour === "0 h" ? "jusqu'à minuit" : `jusqu'à demain ${hour}`;
	}
	return `jusqu'au ${end.toLocaleDateString("fr-FR", { timeZone: PARIS, day: "numeric", month: "long" })} à ${hour}`;
}
