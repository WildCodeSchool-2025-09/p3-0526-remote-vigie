import Icon from "@/components/Icon/Icon";
import NumberRow from "@/components/numbers/NumberRow/NumberRow";
import { getEmergencyNumbers } from "@/services/numberService";
import type { EmergencyCategory } from "@/types/numbers";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";

type Status = "loading" | "error" | "success";

export default function Numbers() {
	const navigate = useNavigate();
	const [status, setStatus] = useState<Status>("loading");
	const [categories, setCategories] = useState<EmergencyCategory[]>([]);

	const load = useCallback(async () => {
		setStatus("loading");
		const result = await getEmergencyNumbers();
		if (result.status === "error") {
			setStatus("error");
			return;
		}
		setCategories(result.categories);
		setStatus("success");
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
