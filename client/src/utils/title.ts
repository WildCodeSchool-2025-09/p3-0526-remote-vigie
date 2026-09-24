export default function withPreposition(city: string): string {
	if (city.startsWith("Le ")) return `au ${city.slice(3)}`;
	if (city.startsWith("Les ")) return `aux ${city.slice(4)}`;
	return `à ${city}`;
}
