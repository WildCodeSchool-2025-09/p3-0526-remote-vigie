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
