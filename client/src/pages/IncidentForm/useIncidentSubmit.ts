import { createIncident } from "@/services/incidentService";
import type { Incident } from "@/types/incidentDetails";
import type { Position } from "@/types/incidentForm";
import { useState } from "react";
import { useNavigate } from "react-router";

type Params = {
	position: Position | null;
	selectedTypes: number[];
	dangerLevel: number | null;
	setSelectionError: (message: string | null) => void;
	setDangerLevelError: (message: string | null) => void;
};

export default function useIncidentSubmit({
	position,
	selectedTypes,
	dangerLevel,
	setSelectionError,
	setDangerLevelError,
}: Params) {
	const navigate = useNavigate();

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [photoUrl, setPhotoUrl] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [serverError, setServerError] = useState<string | null>(null);
	const [confirmation, setConfirmation] = useState<Incident | null>(null);

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (position === null) {
			setServerError(
				"Votre position n'est pas encore déterminée. Veuillez patienter ou choisir une adresse.",
			);
			return;
		}

		if (selectedTypes.length === 0) {
			setSelectionError("Sélectionnez au moins un type de signalement.");
			return;
		}
		setSelectionError(null);

		if (dangerLevel === null) {
			setDangerLevelError("Sélectionnez un niveau de gravité.");
			return;
		}

		setSubmitting(true);

		const incidentPayload = {
			typeIds: selectedTypes,
			latitude: position.lat,
			longitude: position.lng,
			dangerLevelId: dangerLevel,
			title,
			description,
			photoUrl,
		};

		const result = await createIncident(incidentPayload);

		if (result.status === "ok") {
			setConfirmation(result.incident);
			return;
		}

		setSubmitting(false);

		if (result.status === "unauthorized") {
			navigate("/login");
			return;
		}

		if (result.status === "invalid") {
			if (result.error === "invalid_type_ids") {
				setSelectionError(result.message);
			} else if (result.error === "invalid_danger_level_id") {
				setDangerLevelError(result.message);
			} else {
				setServerError(result.message);
			}
			return;
		}

		if (
			result.status === "forbidden" ||
			result.status === "tooManyRequests" ||
			result.status === "duplicate"
		) {
			setServerError(result.message);
			return;
		}

		if (result.status === "networkError") {
			setServerError(
				"Impossible de contacter le serveur. Vérifiez votre connexion et réessayez.",
			);
			return;
		}

		setServerError("Une erreur est survenue. Veuillez réessayer.");
	}

	return {
		title,
		onTitleChange: setTitle,
		description,
		onDescriptionChange: setDescription,
		photoUrl,
		onPhotoUrlChange: setPhotoUrl,
		submitting,
		serverError,
		confirmation,
		handleSubmit,
	};
}
