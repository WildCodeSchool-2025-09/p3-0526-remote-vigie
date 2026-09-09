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
				setIncidentTypes(
					types.filter((type) => type.is_selectable === 1),
				);
				setLoadingTypes(false);
			})
			.catch((error) => {
				if (error.name === "AbortError") return;
				setTypesError(
					"Impossible de charger les types de signalement.",
				);
				setLoadingTypes(false);
			});
	}, []);

	useEffect(() => {
		const controller = new AbortController();
		loadIncidentTypes(controller.signal);
		return () => controller.abort();
	}, [loadIncidentTypes]);

	// PrivateRoute a déjà filtré les non-connectés : ici `user` existe.
	// S'il n'a pas vérifié son e-mail, on bloque le signalement.
	if (!user?.emailVerified) {
		return <EmailVerificationNotice />;
	}

	return (
		<section>
			<h1>Signaler un incident</h1>

			{loadingTypes && <p>Chargement des types…</p>}

			{typesError && (
				<div>
					<p role="alert">{typesError}</p>
					<button type="button" onClick={() => loadIncidentTypes()}>
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
	);
}
