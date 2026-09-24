// "12 mars à 18:40"
export function formatDateTime(iso: string): string {
	const date = new Date(iso);

	const day = date.toLocaleDateString("fr-FR", {
		day: "numeric",
		month: "long",
	});
	const time = date.toLocaleTimeString("fr-FR", {
		hour: "2-digit",
		minute: "2-digit",
	});

	return `${day} à ${time}`;
}
export function formatTime(iso: string): string {
	return new Date(iso).toLocaleTimeString("fr-FR", {
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function formatReportedAt(iso: string): string {
	const date = new Date(iso);
	const time = formatTime(iso);

	const today = new Date();
	const yesterday = new Date(today);
	yesterday.setDate(today.getDate() - 1);

	if (date.toDateString() === today.toDateString()) {
		return `aujourd'hui à ${time}`;
	}
	if (date.toDateString() === yesterday.toDateString()) {
		return `hier à ${time}`;
	}
	return `le ${formatDateTime(iso)}`;
}

export function formatDate(iso: string): string {
	const value = new Date(iso);
	if (Number.isNaN(value.getTime())) return "Récemment";
	const elapsedMinutes = Math.max(
		0,
		Math.floor((Date.now() - value.getTime()) / 60000),
	);
	if (elapsedMinutes < 60) return `il y a ${elapsedMinutes || 1} min`;
	const elapsedHours = Math.floor(elapsedMinutes / 60);
	if (elapsedHours < 24) return `il y a ${elapsedHours} h`;
	const elapsedDays = Math.floor(elapsedHours / 24);
	return `il y a ${elapsedDays} j`;
}
