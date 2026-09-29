import type { EmergencyCategory } from "@/types/numbers";

const CATEGORIES: EmergencyCategory[] = [
	{
		title: "Urgences · 24 h/24",
		numbers: [
			{
				name: "Urgences européennes",
				number: "112",
				description: "Depuis tout pays de l'Union européenne",
				action: "call",
			},
			{
				name: "Pompiers",
				number: "18",
				description: "Incendie, accident, inondation",
				action: "call",
			},
			{
				name: "SAMU",
				number: "15",
				description: "Urgence médicale",
				action: "call",
			},
			{
				name: "Police secours",
				number: "17",
				description: "Danger sur la route, atteinte aux personnes",
				action: "call",
			},
		],
	},
	{
		title: "Urgences spécifiques",
		numbers: [
			{
				name: "Sourds et malentendants",
				number: "114",
				description: "Par SMS, tchat ou visio",
				action: "sms",
			},
			{
				name: "Secours en mer",
				number: "196",
				description: "Littoral et plans d'eau",
				action: "call",
			},
		],
	},
	{
		title: "Santé",
		numbers: [
			{
				name: "Médecin de garde",
				number: "116 117",
				description: "Soins non urgents, nuit et week-end",
				action: "call",
			},
			{
				name: "Centre antipoison (Orfila)",
				number: "01 45 42 59 59",
				description:
					"Ingestion, contact avec un produit toxique · redirige vers le centre régional le plus proche",
				action: "call",
			},
		],
	},
];

type GetEmergencyNumbersResult =
	| { status: "ok"; categories: EmergencyCategory[] }
	| { status: "error" };

export async function getEmergencyNumbers(): Promise<GetEmergencyNumbersResult> {
	// Dev uniquement : simule latence + échec (~30%) pour tester loading/erreur.
	// Avec un vrai fetch : try/catch → { status: "error" } (cf. incidentService).
	if (import.meta.env.DEV) {
		await new Promise((resolve) => setTimeout(resolve, 500));
		if (Math.random() < 0.3) return { status: "error" };
	}

	return { status: "ok", categories: CATEGORIES };
}
