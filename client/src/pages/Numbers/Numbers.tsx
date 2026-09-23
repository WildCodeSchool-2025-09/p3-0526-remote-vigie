import Icon from "@/components/Icon/Icon";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";

type EmergencyNumber = {
	name: string;
	number: string;
	description: string;
	action: "call" | "sms";
};

type EmergencyCategory = {
	title: string;
	numbers: EmergencyNumber[];
};

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

// Simule un appel réseau (délai + échec aléatoire ~30%) en attendant que la liste
// soit servie par une vraie API. À remplacer par un fetch réel, le reste du
// composant (loading/error/retry) restera valable tel quel.
function loadEmergencyNumbers(): Promise<EmergencyCategory[]> {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			if (Math.random() < 0.3) {
				reject(new Error("Failed to load emergency numbers"));
			} else {
				resolve(CATEGORIES);
			}
		}, 500);
	});
}

function NumberRow({ entry }: { entry: EmergencyNumber }) {
	const dialNumber = entry.number.replace(/\s/g, "");
	const href =
		entry.action === "sms" ? `sms:${dialNumber}` : `tel:${dialNumber}`;
	const label = entry.action === "sms" ? "SMS" : "Appeler";

	return (
		<section className="flex items-center gap-3 rounded-2xl bg-base-300 p-4">
			<p className="w-16 shrink-0 text-center font-title text-2xl font-bold text-error">
				{entry.number}
			</p>

			<div className="min-w-0 flex-1">
				<p className="font-bold text-primary">{entry.name}</p>
				<p className="mt-0.5 text-xs text-primary/50">
					{entry.description}
				</p>
			</div>

			<a
				href={href}
				className={
					entry.action === "sms"
						? "btn btn-sm shrink-0 gap-1.5 rounded-full border-2 border-primary bg-transparent px-4 font-bold text-primary shadow-none hover:bg-primary/10"
						: "btn btn-accent btn-sm shrink-0 gap-1.5 rounded-full border-none px-4 font-bold"
				}
			>
				{entry.action === "call" && (
					<Icon
						name="phoneFlip"
						className="h-3.5 w-3.5 fill-primary"
						aria-hidden="true"
					/>
				)}
				{label}
			</a>
		</section>
	);
}

type Status = "loading" | "error" | "success";

export default function Numbers() {
	const navigate = useNavigate();
	const [status, setStatus] = useState<Status>("loading");
	const [categories, setCategories] = useState<EmergencyCategory[]>([]);

	const load = useCallback(async () => {
		setStatus("loading");
		try {
			const data = await loadEmergencyNumbers();
			setCategories(data);
			setStatus("success");
		} catch {
			setStatus("error");
		}
	}, []);

	useEffect(() => {
		load();
	}, [load]);

	return (
		<div className="NUMBERS-PAGE bg-base-100">
			<header className="relative isolate flex h-44 flex-col justify-end overflow-hidden bg-primary px-4 pt-4 pb-12">
				<div className="flex items-start gap-3">
					<button
						type="button"
						onClick={() => navigate("/")}
						aria-label="Retour"
						className="btn btn-square btn-md shrink-0 rounded-2xl border border-white/40 bg-white/20 shadow-none hover:bg-white/50"
					>
						<Icon
							name="angleSmallLeft"
							className="h-4 w-4 fill-white"
							aria-hidden="true"
						/>
					</button>

					<div>
						<h1 className="font-title text-2xl font-bold text-accent">
							Numéros utiles
						</h1>
						<p className="mt-1 text-sm text-white/85">
							Vigie prévient vos voisins, mais ne contacte pas les
							secours.
						</p>
					</div>
				</div>
			</header>

			<div className="relative -mt-8 space-y-4 px-4 pb-6">
				{status === "loading" && (
					<p className="py-8 text-center text-sm text-primary/50">
						Chargement des numéros utiles…
					</p>
				)}

				{status === "error" && (
					<div className="flex flex-col gap-4 rounded-3xl bg-(--bg-error) p-4">
						<div className="flex items-start gap-3">
							<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-error">
								<Icon
									name="exclamation"
									className="h-3.5 w-3.5 fill-white"
									aria-hidden="true"
								/>
							</span>
							<div>
								<h2 className="font-title text-lg font-bold text-error">
									Impossible de charger la liste
								</h2>
								<p className="mt-1 text-sm text-black">
									La connexion au serveur a échoué. En cas
									d'urgence, composez le 112 directement
									depuis votre téléphone.
								</p>
							</div>
						</div>
						<button
							type="button"
							onClick={load}
							className="btn btn-md w-full rounded-full border-none bg-error px-5 font-bold text-white"
						>
							Réessayer
						</button>
					</div>
				)}

				{status === "success" &&
					categories.map((category) => (
						<div
							key={category.title}
							className="rounded-2xl bg-base-200 p-4"
						>
							<h2 className="font-title text-lg font-bold text-primary">
								{category.title}
							</h2>
							<div className="mt-3 space-y-3">
								{category.numbers.map((entry) => (
									<NumberRow
										key={entry.number}
										entry={entry}
									/>
								))}
							</div>
						</div>
					))}
			</div>
		</div>
	);
}
