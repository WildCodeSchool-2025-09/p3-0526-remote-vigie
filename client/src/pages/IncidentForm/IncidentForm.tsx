import EmailVerificationNotice from "@/components/EmailVerificationNotice/EmailVerificationNotice";
import IncidentTypePicker from "@/components/IncidentTypePicker/IncidentTypePicker";
import { useAuth } from "@/contexts/AuthContext";
import { getIncidentTypes } from "@/services/incidentTypeService";
import type { IncidentType } from "@/types/incidentForm";
import { useEffect, useState } from "react";

export default function IncidentForm() {
	const { user } = useAuth();

	const [incidentTypes, setIncidentTypes] = useState<IncidentType[]>([]);
	const [selectedTypes, setSelectedTypes] = useState<number[]>([]);
	const [loadingTypes, setLoadingTypes] = useState(true);
	const [typesError, setTypesError] = useState<string | null>(null);

	useEffect(() => {
		const controller = new AbortController();

		getIncidentTypes(controller.signal)
			.then((types) => {
				setIncidentTypes(
					types.filter((type) => type.is_selectable === 1),
				);
				setTypesError(null);
				setLoadingTypes(false);
			})
			.catch((error) => {
				if (error.name === "AbortError") return;
				setTypesError(
					"Impossible de charger les types de signalement.",
				);
				setLoadingTypes(false);
			});

		return () => controller.abort();
	}, []);

	// PrivateRoute a déjà filtré les non-connectés : ici `user` existe.
	// S'il n'a pas vérifié son e-mail, on bloque le signalement.
	if (!user?.emailVerified) {
		return <EmailVerificationNotice />;
	}

	return (
		<section>
			<h1>Signaler un incident</h1>

			{loadingTypes && <p>Chargement des types…</p>}
			{typesError && <p role="alert">{typesError}</p>}

			{!loadingTypes && !typesError && (
				<IncidentTypePicker
					incidentTypes={incidentTypes}
					value={selectedTypes}
					onChange={setSelectedTypes}
				/>
			)}
		</section>
	);
}
