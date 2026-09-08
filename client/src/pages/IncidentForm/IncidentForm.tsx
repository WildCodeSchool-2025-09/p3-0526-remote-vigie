import EmailVerificationNotice from "@/components/EmailVerificationNotice/EmailVerificationNotice";
import { useAuth } from "@/contexts/AuthContext";
import { type IncidentType, getIncidentTypes } from "@/services/incidentTypes";
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
				// Nettoyage de l'effet : composant démonté, on ne touche plus au state.
				if (error.name === "AbortError") return;
				setTypesError(
					"Impossible de charger les types de signalement.",
				);
				setLoadingTypes(false);
			});

		return () => controller.abort();
	}, []);

	function toggleType(id: number) {
		setSelectedTypes((current) =>
			current.includes(id)
				? current.filter((typeId) => typeId !== id)
				: [...current, id],
		);
	}

	// PrivateRoute a déjà filtré les non-connectés : ici `user` existe.
	// S'il n'a pas vérifié son e-mail, on bloque le signalement.
	if (!user?.emailVerified) {
		return <EmailVerificationNotice />;
	}

	return (
		<section>
			<h1>Signaler un incident</h1>

			<fieldset>
				<legend>Type d'incident</legend>

				{loadingTypes && <p>Chargement des types…</p>}
				{typesError && <p role="alert">{typesError}</p>}

				{!loadingTypes &&
					!typesError &&
					incidentTypes.map((type) => (
						<label key={type.id}>
							<input
								type="checkbox"
								checked={selectedTypes.includes(type.id)}
								onChange={() => toggleType(type.id)}
							/>
							{type.label}
						</label>
					))}
			</fieldset>
		</section>
	);
}
