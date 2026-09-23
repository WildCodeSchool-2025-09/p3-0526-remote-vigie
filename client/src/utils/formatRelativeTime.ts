// Ancienneté lisible : "il y a 12 min", "il y a 1 h", "il y a 3 j".
// Fonction pure et réutilisable (liste US03, fiche US02, carte US04…).

const rtf = new Intl.RelativeTimeFormat("fr", {
	numeric: "always",
	style: "short",
});

export function formatRelativeTime(iso: string): string {
	const diffSeconds = Math.round(
		(new Date(iso).getTime() - Date.now()) / 1000,
	);

	if (Math.abs(diffSeconds) < 60) {
		return "à l'instant";
	}

	const diffMinutes = Math.round(diffSeconds / 60);
	if (Math.abs(diffMinutes) < 60) {
		return rtf.format(diffMinutes, "minute");
	}

	const diffHours = Math.round(diffSeconds / 3600);
	if (Math.abs(diffHours) < 24) {
		return rtf.format(diffHours, "hour");
	}

	const diffDays = Math.round(diffSeconds / 86400);
	return rtf.format(diffDays, "day");
}
