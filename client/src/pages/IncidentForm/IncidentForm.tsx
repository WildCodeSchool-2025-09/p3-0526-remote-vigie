import EmailVerificationNotice from "@/components/Form/EmailVerificationNotice/EmailVerificationNotice";
import IncidentTypePicker from "@/components/Form/IncidentTypePicker/IncidentTypePicker";
import SafetyInstructions from "@/components/SafetyInstructions/SafetyInstructions";
import { useAuth } from "@/contexts/AuthContext";
import { getIncidentTypes } from "@/services/incidentTypeService";
import type { IncidentType } from "@/types/incidentForm";
import { useCallback, useEffect, useState } from "react";

export default function IncidentForm() {
	const { user } = useAuth();

	const [incidentTypes, setIncidentTypes] = useState<IncidentType[]>([]);
	const [selectedTypes, setSelectedTypes] = useState<number[]>([]);
	const [loadingTypes, setLoadingTypes] = useState(true);
	const [typesError, setTypesError] = useState<string | null>(null);

	const loadIncidentTypes = useCallback((signal?: AbortSignal) => {
		setLoadingTypes(true);
		setTypesError(null);

		getIncidentTypes(signal)
			.then((types) => {
				setIncidentTypes(types);
				setLoadingTypes(false);
			})
			.catch((error) => {
				if (error.name === "AbortError") return;
				setTypesError(
					"Impossible de charger les types de signalement...",
				);
				setLoadingTypes(false);
			});
	}, []);

	useEffect(() => {
		if (!user?.emailVerified) return;

		const controller = new AbortController();
		loadIncidentTypes(controller.signal);
		return () => controller.abort();
	}, [loadIncidentTypes, user?.emailVerified]);

	// PrivateRoute a déjà filtré les non-connectés : ici `user` existe.
	// S'il n'a pas vérifié son e-mail, on bloque le signalement.
	if (!user?.emailVerified) {
		return <EmailVerificationNotice />;
	}

	return (
		<div className="min-h-screen bg-base-100">
			<header className="relative isolate flex h-44 flex-col justify-end overflow-hidden bg-primary px-4 pt-4 pb-12">
				<img
					src="/src/assets/images/background-incident.jpg"
					alt=""
					aria-hidden="true"
					className="absolute inset-0 -z-10 h-full w-full object-cover opacity-70 mix-blend-multiply"
				/>
				<h1 className="font-title text-2xl font-bold text-accent">
					Nouveau signalement
				</h1>
				<p className="mt-1 text-sm text-white/85">
					Vos voisins concernés seront alertés aussitôt.
				</p>
			</header>
			<div className="relative -mt-8 space-y-4 px-4 pb-6">
				<section className="rounded-2xl bg-base-200 p-4">
					<div className="flex items-center gap-2 pb-8">
						<span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-content">
							1
						</span>
						<h2 className="font-title text-lg font-bold text-primary">
							Que voulez-vous signaler ?
						</h2>
					</div>
					{loadingTypes && <p>Chargement des types…</p>}
					{typesError && (
						<div className="text-center">
							<p role="alert" className="m-2 ">
								{typesError}
							</p>
							<button
								type="button"
								className="btn btn-accent btn-md w-full grow rounded-full border-none px-5 font-bold"
								onClick={() => loadIncidentTypes()}
							>
								Réessayer
							</button>
						</div>
					)}
					{!loadingTypes && !typesError && (
						<>
							<IncidentTypePicker
								incidentTypes={incidentTypes}
								value={selectedTypes}
								onChange={setSelectedTypes}
							/>
							<SafetyInstructions
								incidentTypes={incidentTypes}
								value={selectedTypes}
							/>
						</>
					)}
				</section>
				<section className="rounded-2xl bg-base-200 p-4">…</section>
				<section className="rounded-2xl bg-base-200 p-4">…</section>
			</div>
		</div>
	);
}
